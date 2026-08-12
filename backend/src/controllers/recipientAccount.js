const { models, Op, successResponse, errorResponse, CareGiver, CareNeed, CareRecipient, SettlementRequest, resolveSkills } = require('./recipientShared');

/**
 * Update recipient's email
 * 
 * SECURITY:
 * - Requires current password verification
 */
const updateEmail = async (req, res, next) => {
  try {
    const recipientId = req.user.id;
    const { currentPassword, newEmail } = req.body;
    
    if (!currentPassword || !newEmail) {
      return errorResponse(res, 'Current password and new email are required', 400, 'MISSING_FIELDS');
    }
    
    const recipient = await CareRecipient.findByPk(recipientId);
    
    if (!recipient) {
      return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Verify current password
    const isValidPassword = await recipient.validatePassword(currentPassword);
    if (!isValidPassword) {
      return errorResponse(res, 'Current password is incorrect', 401, 'INVALID_PASSWORD');
    }
    
    // Check if email is already in use
    const existingUser = await CareRecipient.findOne({ where: { email: newEmail } });
    if (existingUser && existingUser.id !== recipientId) {
      return errorResponse(res, 'Email is already in use', 400, 'EMAIL_IN_USE');
    }
    
    await CareRecipient.update({ email: newEmail }, { where: { id: recipientId } });
    
    return successResponse(res, null, 'Email updated successfully');
    
  } catch (error) {
    next(error);
  }
};

/**
 * Update recipient's password
 * 
 * SECURITY:
 * - Requires current password verification
 */
const updatePassword = async (req, res, next) => {
  try {
    const recipientId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current password and new password are required', 400, 'MISSING_FIELDS');
    }
    
    if (newPassword.length < 8) {
      return errorResponse(res, 'New password must be at least 8 characters', 400, 'PASSWORD_TOO_SHORT');
    }
    
    const recipient = await CareRecipient.findByPk(recipientId);
    
    if (!recipient) {
      return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Verify current password
    const isValidPassword = await recipient.validatePassword(currentPassword);
    if (!isValidPassword) {
      return errorResponse(res, 'Current password is incorrect', 401, 'INVALID_PASSWORD');
    }
    
    // Update password (will be hashed by model hook)
    recipient.password = newPassword;
    await recipient.save();
    
    return successResponse(res, null, 'Password updated successfully');
    
  } catch (error) {
    next(error);
  }
};

module.exports = { updateEmail, updatePassword };
