const { models, Op, successResponse, errorResponse, CareRecipient, CareNeed, CareGiver, Review, SettlementRequest, Notification, createRatingNotification, resolveCareNeeds } = require('./caregiverShared');

/**
 * Get a single care recipient's public profile
 * 
 * SECURITY:
 * - Only authenticated care_givers can access
 * - Limited data exposure - no sensitive info
 */
const getClientProfile = async (req, res, next) => {
  try {
    const clientId = parseInt(req.params.id);
    
    if (isNaN(clientId)) {
      return errorResponse(res, 'Invalid client ID', 400, 'INVALID_ID');
    }
    
    // Fetch care needs for resolving IDs
    const allCareNeeds = await CareNeed.findAll({
      where: { isActive: true },
      attributes: ['id', 'key', 'labelEn', 'labelDe', 'labelFr'],
    });
    
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
    
    const client = await CareRecipient.findOne({
      where: {
        id: clientId,
        isActive: true,
      },
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
        'isSettled',
        'settledWithCaregiverId',
      ],
    });
    
    if (!client) {
      return errorResponse(res, 'Client not found', 404, 'CLIENT_NOT_FOUND');
    }
    
    // If client is settled and not with this caregiver, deny access
    if (client.isSettled && client.settledWithCaregiverId !== req.user.id) {
      return errorResponse(res, 'Client not found', 404, 'CLIENT_NOT_FOUND');
    }
    
    return successResponse(res, {
      client: {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName?.charAt(0) + '.', // Privacy: only initial
        address: client.address,
        postalCode: client.postalCode,
        country: client.country,
        careNeeds: resolveCareNeeds(client.careNeeds, careNeedsMap),
        bio: client.bio,
        profileImageUrl: client.profileImageUrl,
        memberSince: client.createdAt,
      },
    }, 'Client profile retrieved successfully');
    
  } catch (error) {
    next(error);
  }
};

/**
 * Get available filter options (countries, care needs)
 */
const getFilterOptions = async (req, res, next) => {
  try {
    // Get distinct countries
    const countries = await CareRecipient.findAll({
      attributes: [[models.sequelize.fn('DISTINCT', models.sequelize.col('country')), 'country']],
      where: { isActive: true, country: { [Op.ne]: null } },
      raw: true,
    });
    
    // Get all care needs from config
    const careNeeds = await CareNeed.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']],
    });
    
    return successResponse(res, {
      countries: countries.map(c => c.country).filter(Boolean).sort(),
      careNeeds: careNeeds.map(cn => ({
        id: cn.id,
        key: cn.key,
        labelEn: cn.labelEn,
        labelDe: cn.labelDe,
        labelFr: cn.labelFr,
      })),
    }, 'Filter options retrieved successfully');
    
  } catch (error) {
    next(error);
  }
};

module.exports = { getClientProfile, getFilterOptions };
