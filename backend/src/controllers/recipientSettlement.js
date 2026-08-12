const { models, Op, successResponse, errorResponse, CareGiver, CareNeed, CareRecipient, SettlementRequest, resolveSkills } = require('./recipientShared');

/**
 * Settle with a caregiver (care recipient sends a settlement request)
 * Creates a pending request that the caregiver must confirm.
 * 
 * POST /api/recipient/settle
 * Body: { caregiverEmail: string } OR { caregiverId: number }
 */
const settleWithCaregiver = async (req, res, next) => {
  try {
    const recipientId = req.user.id;
    const { caregiverEmail, caregiverId } = req.body;
    
    if (!caregiverEmail && !caregiverId) {
      return errorResponse(res, 'Caregiver email or ID is required', 400, 'MISSING_FIELDS');
    }
    
    const recipient = await CareRecipient.findByPk(recipientId);
    if (!recipient) {
      return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
    }
    
    if (recipient.isSettled) {
      return errorResponse(res, 'You are already settled with a caregiver', 400, 'ALREADY_SETTLED');
    }

    // Check if there's already a pending request from this recipient
    const existingPending = await SettlementRequest.findOne({
      where: { careRecipientId: recipientId, status: 'pending' },
    });
    if (existingPending) {
      return errorResponse(res, 'You already have a pending settlement request', 400, 'REQUEST_PENDING');
    }
    
    // Find the caregiver
    let caregiver;
    if (caregiverId) {
      caregiver = await CareGiver.findOne({ where: { id: caregiverId, isActive: true } });
    } else {
      caregiver = await CareGiver.findOne({ where: { email: caregiverEmail, isActive: true } });
    }
    
    if (!caregiver) {
      return errorResponse(res, 'Caregiver not found', 404, 'CAREGIVER_NOT_FOUND');
    }

    // Create a pending settlement request
    const request = await SettlementRequest.create({
      careRecipientId: recipientId,
      careGiverId: caregiver.id,
      status: 'pending',
    });
    
    return successResponse(res, {
      requestId: request.id,
      caregiverId: caregiver.id,
      caregiverName: `${caregiver.firstName} ${caregiver.lastName}`,
      status: 'pending',
    }, 'Settlement request sent. Waiting for caregiver confirmation.');
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a pending settlement request (care recipient withdraws)
 * 
 * POST /api/recipient/cancel-settlement
 */
const cancelSettlementRequest = async (req, res, next) => {
  try {
    const recipientId = req.user.id;

    const pendingRequest = await SettlementRequest.findOne({
      where: { careRecipientId: recipientId, status: 'pending' },
    });

    if (!pendingRequest) {
      return errorResponse(res, 'No pending settlement request found', 404, 'NO_PENDING_REQUEST');
    }

    await pendingRequest.destroy();

    return successResponse(res, null, 'Settlement request cancelled');
  } catch (error) {
    next(error);
  }
};

/**
 * Unsettle from caregiver
 * 
 * POST /api/recipient/unsettle
 */
const unsettleFromCaregiver = async (req, res, next) => {
  try {
    const recipientId = req.user.id;
    
    const recipient = await CareRecipient.findByPk(recipientId);
    if (!recipient) {
      return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
    }
    
    if (!recipient.isSettled) {
      return errorResponse(res, 'You are not currently settled', 400, 'NOT_SETTLED');
    }
    
    await recipient.update({
      isSettled: false,
      settledWithCaregiverId: null,
      settledAt: null,
    });
    
    return successResponse(res, null, 'Successfully unsettled');
  } catch (error) {
    next(error);
  }
};

module.exports = { settleWithCaregiver, cancelSettlementRequest, unsettleFromCaregiver };
