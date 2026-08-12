const { models, Op, successResponse, errorResponse, CareRecipient, CareNeed, CareGiver, Review, SettlementRequest, Notification, createRatingNotification, resolveCareNeeds } = require('./caregiverShared');

/**
 * Get a settled client's full profile (caregiver can see full details)
 */
const getSettledClientProfile = async (req, res, next) => {
  try {
    const caregiverId = req.user.id;
    const clientId = parseInt(req.params.id);
    
    if (isNaN(clientId)) {
      return errorResponse(res, 'Invalid client ID', 400, 'INVALID_ID');
    }
    
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
        isSettled: true,
        settledWithCaregiverId: caregiverId,
        isActive: true,
      },
      attributes: [
        'id', 'firstName', 'lastName', 'email', 'phone',
        'dateOfBirth', 'address', 'postalCode', 'country',
        'careNeeds', 'bio', 'emergencyContactName', 'emergencyContactPhone',
        'profileImageUrl', 'settledAt', 'createdAt',
      ],
    });
    
    if (!client) {
      return errorResponse(res, 'Client not found', 404, 'CLIENT_NOT_FOUND');
    }
    
    return successResponse(res, {
      client: {
        ...client.toJSON(),
        careNeeds: resolveCareNeeds(client.careNeeds, careNeedsMap),
        memberSince: client.createdAt,
      },
    }, 'Client profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get reviews for the currently logged-in caregiver
 * GET /api/caregiver/reviews
 */
const getMyReviews = async (req, res, next) => {
  try {
    const caregiverId = req.user.id;

    const reviews = await Review.findAll({
      where: { careGiverId: caregiverId },
      include: [
        {
          model: CareRecipient,
          as: 'careRecipient',
          attributes: ['id', 'firstName', 'lastName', 'profileImageUrl'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, { reviews });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending settlement requests for the current caregiver
 * GET /api/caregiver/settlement-requests
 */
const getSettlementRequests = async (req, res, next) => {
  try {
    const caregiverId = req.user.id;

    const requests = await SettlementRequest.findAll({
      where: { careGiverId: caregiverId, status: 'pending' },
      include: [{
        model: CareRecipient,
        as: 'careRecipient',
        attributes: ['id', 'firstName', 'lastName', 'email', 'profileImageUrl', 'country'],
      }],
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, { requests });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettledClientProfile, getMyReviews, getSettlementRequests };
