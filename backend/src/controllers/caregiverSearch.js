const { models, Op, successResponse, errorResponse, CareRecipient, CareNeed, CareGiver, Review, SettlementRequest, Notification, createRatingNotification, resolveCareNeeds } = require('./caregiverShared');

/**
 * Get paginated care recipients (clients) for caregivers to browse
 * Implements infinite scroll with limit/offset pagination
 * 
 * SECURITY: 
 * - Only authenticated care_givers can access
 * - No sensitive data exposed (password, etc.)
 * - Input validation on all query params
 * 
 * NOTE: careNeeds is stored as JSON array of IDs (integers), not text
 * We resolve these IDs to their labels dynamically from the care_needs table
 */
const findClients = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 25)); // Max 50, default 25
    const offset = (page - 1) * limit;
    
    // Build where clause based on filters
    const whereClause = {
      isActive: true, // Only show active users
      isSettled: false, // Exclude settled care recipients
    };
    
    // Search by postal code or address
    const search = req.query.search?.trim();
    if (search) {
      const searchTerms = search.split(/\s+/).filter(Boolean);
      
      if (searchTerms.length === 1) {
        // Single word: match against any field (original behavior)
        whereClause[Op.or] = [
          { postalCode: { [Op.like]: `%${searchTerms[0]}%` } },
          { address: { [Op.like]: `%${searchTerms[0]}%` } },
        ];
      } else {
        // Multiple words: ALL words must match across any of the searchable fields
        const searchFields = ['postalCode', 'address'];
        whereClause[Op.and] = whereClause[Op.and] || [];
        searchTerms.forEach(term => {
          whereClause[Op.and].push({
            [Op.or]: searchFields.map(field => ({
              [field]: { [Op.like]: `%${term}%` },
            })),
          });
        });
      }
    }
    
    // Filter by country
    if (req.query.country) {
      whereClause.country = req.query.country;
    }
    
    // Filter by care needs (expertise required)
    // careNeeds is stored as JSON array of IDs
    if (req.query.careNeeds) {
      const careNeedsFilter = Array.isArray(req.query.careNeeds) 
        ? req.query.careNeeds.map(id => parseInt(id)).filter(id => !isNaN(id))
        : [parseInt(req.query.careNeeds)].filter(id => !isNaN(id));
      
      // For JSON array field, we need to check if any of the requested care need IDs are present
      if (careNeedsFilter.length > 0) {
        const careNeedConditions = careNeedsFilter.map(id => 
          models.sequelize.literal(`JSON_CONTAINS(care_needs, '${id}')`)
        );
        whereClause[Op.and] = whereClause[Op.and] || [];
        whereClause[Op.and].push({
          [Op.or]: careNeedConditions
        });
      }
    }
    
    // Fetch all active care needs to resolve IDs to labels
    const allCareNeeds = await CareNeed.findAll({
      where: { isActive: true },
      attributes: ['id', 'key', 'labelEn', 'labelDe', 'labelFr'],
    });
    
    // Create a map for quick lookup
    const careNeedsMap = {};
    allCareNeeds.forEach(cn => {
      careNeedsMap[cn.id] = {
        id: cn.id,
        key: cn.key,
        labelEn: cn.labelEn,
        labelDe: cn.labelDe,
        labelFr: cn.labelFr,
      };
    });
    
    // Fetch care recipients with pagination
    const { count, rows: clients } = await CareRecipient.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id',
        'firstName',
        'lastName',
        'address',
        'postalCode',
        'country',
        'careNeeds',
        'bio',
        'profileImageUrl',
        'createdAt',
      ],
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);
    const hasMore = page < totalPages;
    
    return successResponse(res, {
      clients: clients.map(client => ({
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName?.charAt(0) + '.', // Only show initial for privacy
        address: client.address,
        postalCode: client.postalCode,
        country: client.country,
        careNeeds: resolveCareNeeds(client.careNeeds, careNeedsMap),
        bio: client.bio,
        profileImageUrl: client.profileImageUrl,
        createdAt: client.createdAt,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: count,
        limit,
        hasMore,
      },
    }, 'Clients retrieved successfully');
    
  } catch (error) {
    next(error);
  }
};

module.exports = { findClients };
