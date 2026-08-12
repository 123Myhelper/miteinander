const { models, Op, successResponse, errorResponse, CareGiver, CareNeed, CareRecipient, SettlementRequest, resolveSkills } = require('./recipientShared');

/**
 * Get paginated care givers for care recipients to browse
 * Implements infinite scroll with limit/offset pagination
 * 
 * SECURITY: 
 * - Only authenticated care_recipients can access
 * - No sensitive data exposed (password, etc.)
 * - Input validation on all query params
 * 
 * NOTE: skills is stored as JSON array of IDs (integers), not text
 * We resolve these IDs to their labels dynamically from the care_needs table
 */
const findCaregivers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 25)); // Max 50, default 25
    const offset = (page - 1) * limit;
    
    // Build where clause based on filters
    const whereClause = {
      isActive: true, // Only show active users
    };
    
    // Search by name or postal code
    // Split search into words so multiple terms can match across fields
    const search = req.query.search?.trim();
    if (search) {
      const searchTerms = search.split(/\s+/).filter(Boolean);
      
      if (searchTerms.length === 1) {
        // Single word: match against any field (original behavior)
        whereClause[Op.or] = [
          { firstName: { [Op.like]: `%${searchTerms[0]}%` } },
          { lastName: { [Op.like]: `%${searchTerms[0]}%` } },
          { postalCode: { [Op.like]: `%${searchTerms[0]}%` } },
          { occupation: { [Op.like]: `%${searchTerms[0]}%` } },
        ];
      } else {
        // Multiple words: ALL words must match across any of the searchable fields
        const searchFields = ['firstName', 'lastName', 'postalCode', 'occupation'];
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
    
    // Filter by skills (care needs)
    // skills is stored as JSON array of IDs
    if (req.query.skills) {
      const skillsFilter = Array.isArray(req.query.skills) 
        ? req.query.skills.map(id => parseInt(id)).filter(id => !isNaN(id))
        : [parseInt(req.query.skills)].filter(id => !isNaN(id));
      
      // For JSON array field, we need to check if any of the requested skill IDs are present
      if (skillsFilter.length > 0) {
        const skillConditions = skillsFilter.map(id => 
          models.sequelize.literal(`JSON_CONTAINS(skills, '${id}')`)
        );
        whereClause[Op.and] = whereClause[Op.and] || [];
        whereClause[Op.and].push({
          [Op.or]: skillConditions
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
    
    // Fetch caregivers with pagination
    const { count, rows: caregivers } = await CareGiver.findAndCountAll({
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
        'skills',
        'experienceYears',
        'occupation',
        'bio',
        'profileImageUrl',
        'rating',
        'reviewCount',
        'isVerified',
        'createdAt',
      ],
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);
    const hasMore = page < totalPages;
    
    return successResponse(res, {
      caregivers: caregivers.map(caregiver => ({
        id: caregiver.id,
        firstName: caregiver.firstName,
        lastName: caregiver.lastName?.charAt(0) + '.', // Only show initial for privacy
        address: caregiver.address,
        postalCode: caregiver.postalCode,
        country: caregiver.country,
        skills: resolveSkills(caregiver.skills, careNeedsMap),
        experienceYears: caregiver.experienceYears,
        occupation: caregiver.occupation,
        bio: caregiver.bio,
        profileImageUrl: caregiver.profileImageUrl,
        rating: caregiver.rating,
        reviewCount: caregiver.reviewCount,
        isVerified: caregiver.isVerified,
        createdAt: caregiver.createdAt,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: count,
        limit,
        hasMore,
      },
    }, 'Caregivers retrieved successfully');
    
  } catch (error) {
    next(error);
  }
};

module.exports = { findCaregivers };
