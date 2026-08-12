const { models, Op, successResponse, errorResponse, CareRecipient, CareNeed, CareGiver, Review, SettlementRequest, Notification, createRatingNotification, resolveCareNeeds } = require('./caregiverShared');

/**
 * Get count of pending settlement requests
 * GET /api/caregiver/settlement-requests/count
 */
const getSettlementRequestCount = async (req, res, next) => {
  try {
    const caregiverId = req.user.id;

    const count = await SettlementRequest.count({
      where: { careGiverId: caregiverId, status: 'pending' },
    });

    return successResponse(res, { count });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm a settlement request
 * POST /api/caregiver/settlement-requests/:id/confirm
 */
const confirmSettlementRequest = async (req, res, next) => {
  try {
    const caregiverId = req.user.id;
    const requestId = req.params.id;

    const request = await SettlementRequest.findOne({
      where: { id: requestId, careGiverId: caregiverId, status: 'pending' },
    });

    if (!request) {
      return errorResponse(res, 'Settlement request not found', 404, 'REQUEST_NOT_FOUND');
    }

    const recipient = await CareRecipient.findByPk(request.careRecipientId);
    if (!recipient) {
      return errorResponse(res, 'Care recipient not found', 404, 'RECIPIENT_NOT_FOUND');
    }

    if (recipient.isSettled) {
      // Recipient already settled with someone else
      await request.update({ status: 'rejected', respondedAt: new Date() });
      return errorResponse(res, 'This care recipient is already settled with another caregiver', 400, 'ALREADY_SETTLED');
    }

    // Actualize the settlement
    await recipient.update({
      isSettled: true,
      settledWithCaregiverId: caregiverId,
      settledAt: new Date(),
    });

    await request.update({ status: 'confirmed', respondedAt: new Date() });

    // Schedule a rating notification after 1 day
    const caregiver = await CareGiver.findByPk(caregiverId, {
      attributes: ['firstName', 'lastName'],
    });
    const caregiverName = caregiver ? `${caregiver.firstName} ${caregiver.lastName}` : 'your caregiver';
    setTimeout(() => {
      createRatingNotification(request.careRecipientId, caregiverId, caregiverName);
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Create settlement confirmed notification for the care recipient
    try {
      await Notification.create({
        recipientId: request.careRecipientId,
        type: 'settlement_confirmed',
        title: 'Settlement Confirmed',
        message: `${caregiverName} has confirmed your settlement request.`,
        data: { caregiverId },
      });
    } catch (notifErr) {
      console.error('Failed to create settlement confirmed notification:', notifErr);
    }

    return successResponse(res, {
      requestId: request.id,
      recipientId: recipient.id,
      recipientName: `${recipient.firstName} ${recipient.lastName}`,
    }, 'Settlement confirmed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a settlement request
 * POST /api/caregiver/settlement-requests/:id/reject
 */
const rejectSettlementRequest = async (req, res, next) => {
  try {
    const caregiverId = req.user.id;
    const requestId = req.params.id;

    const request = await SettlementRequest.findOne({
      where: { id: requestId, careGiverId: caregiverId, status: 'pending' },
    });

    if (!request) {
      return errorResponse(res, 'Settlement request not found', 404, 'REQUEST_NOT_FOUND');
    }

    await request.update({ status: 'rejected', respondedAt: new Date() });

    // Create settlement declined notification for the care recipient
    try {
      const caregiver = await CareGiver.findByPk(caregiverId, {
        attributes: ['firstName', 'lastName'],
      });
      const caregiverName = caregiver ? `${caregiver.firstName} ${caregiver.lastName}` : 'the caregiver';
      await Notification.create({
        recipientId: request.careRecipientId,
        type: 'settlement_rejected',
        title: 'Settlement Declined',
        message: `${caregiverName} has declined your settlement request.`,
        data: { caregiverId },
      });
    } catch (notifErr) {
      console.error('Failed to create settlement rejected notification:', notifErr);
    }

    return successResponse(res, null, 'Settlement request rejected');
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettlementRequestCount, confirmSettlementRequest, rejectSettlementRequest };
