const { models, successResponse, errorResponse, getPagination, getPagingData, Op, config, Admin, Support, CareGiver, CareRecipient, CareNeed, Review, SettlementRequest, sequelize, getStripe } = require('./adminShared');

/**
 * Get settlement details for a user (care giver or care recipient)
 * GET /api/admin/settlement/:userType/:userId
 * GET /api/support/settlement/:userType/:userId
 */
const getUserSettlementDetails = async (req, res) => {
  try {
    const { userType, userId } = req.params;

    if (!['care-giver', 'care-recipient'].includes(userType)) {
      return errorResponse(res, 'Invalid user type', 400, 'INVALID_USER_TYPE');
    }

    if (userType === 'care-recipient') {
      const recipient = await CareRecipient.findByPk(userId, {
        attributes: ['id', 'firstName', 'lastName', 'isSettled', 'settledWithCaregiverId', 'settledAt'],
      });
      if (!recipient) {
        return errorResponse(res, 'User not found', 404, 'NOT_FOUND');
      }

      let settledWith = null;
      if (recipient.isSettled && recipient.settledWithCaregiverId) {
        const cg = await CareGiver.findByPk(recipient.settledWithCaregiverId, {
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImageUrl'],
          paranoid: false,
        });
        if (cg) {
          settledWith = { id: cg.id, firstName: cg.firstName, lastName: cg.lastName, email: cg.email, profileImageUrl: cg.profileImageUrl };
        }
      }

      // Check for pending request
      const pendingRequest = await SettlementRequest.findOne({
        where: { careRecipientId: userId, status: 'pending' },
        include: [{
          model: CareGiver,
          as: 'careGiver',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          paranoid: false,
        }],
        order: [['createdAt', 'DESC']],
      });

      return successResponse(res, {
        isSettled: recipient.isSettled || false,
        settledAt: recipient.settledAt,
        settledWith,
        pendingRequest: pendingRequest ? {
          id: pendingRequest.id,
          createdAt: pendingRequest.createdAt,
          careGiver: pendingRequest.careGiver ? {
            id: pendingRequest.careGiver.id,
            firstName: pendingRequest.careGiver.firstName,
            lastName: pendingRequest.careGiver.lastName,
            email: pendingRequest.careGiver.email,
          } : null,
        } : null,
      }, 'Settlement details retrieved');
    }

    // care-giver
    const settledClients = await CareRecipient.findAll({
      where: { isSettled: true, settledWithCaregiverId: userId },
      attributes: ['id', 'firstName', 'lastName', 'email', 'profileImageUrl', 'settledAt'],
      paranoid: false,
    });

    const pendingRequests = await SettlementRequest.findAll({
      where: { careGiverId: userId, status: 'pending' },
      include: [{
        model: CareRecipient,
        as: 'careRecipient',
        attributes: ['id', 'firstName', 'lastName', 'email'],
        paranoid: false,
      }],
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, {
      settledClientsCount: settledClients.length,
      settledClients: settledClients.map(c => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        profileImageUrl: c.profileImageUrl,
        settledAt: c.settledAt,
      })),
      pendingRequestsCount: pendingRequests.length,
      pendingRequests: pendingRequests.map(r => ({
        id: r.id,
        createdAt: r.createdAt,
        careRecipient: r.careRecipient ? {
          id: r.careRecipient.id,
          firstName: r.careRecipient.firstName,
          lastName: r.careRecipient.lastName,
          email: r.careRecipient.email,
        } : null,
      })),
    }, 'Settlement details retrieved');
  } catch (error) {
    console.error('getUserSettlementDetails error:', error);
    return errorResponse(res, 'Failed to retrieve settlement details', 500, 'FETCH_ERROR');
  }
};

module.exports = { getUserSettlementDetails };
