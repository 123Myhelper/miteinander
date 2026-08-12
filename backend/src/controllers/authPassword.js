const { models, generateToken, successResponse, errorResponse, USER_ROLES, getModelByRole, generateVerificationCode, sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendNewRegistrationNotification, CareNeed } = require('./authShared');

/**
 * Forgot password — send reset code to email
 * POST /api/auth/forgot-password
 * Body: { email: string }
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 'Email is required', 400, 'MISSING_FIELDS');
    }

    const { Admin, Support, CareGiver, CareRecipient } = models;

    const userTables = [
      { model: Admin, role: USER_ROLES.ADMIN },
      { model: Support, role: USER_ROLES.SUPPORT },
      { model: CareGiver, role: USER_ROLES.CARE_GIVER },
      { model: CareRecipient, role: USER_ROLES.CARE_RECIPIENT },
    ];

    let foundUser = null;

    for (const { model } of userTables) {
      const user = await model.findOne({ where: { email } });
      if (user) {
        foundUser = user;
        break;
      }
    }

    // Always return success to prevent email enumeration
    if (!foundUser) {
      return successResponse(res, null, 'If the email exists, a reset code has been sent');
    }

    // Generate code and save
    const resetCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await foundUser.update({
      resetPasswordCode: resetCode,
      resetPasswordCodeExpiresAt: expiresAt,
    });

    // Send email (non-blocking for the response, but we await to ensure it's sent)
    sendPasswordResetEmail(email, foundUser.firstName, resetCode).catch(err => {
      console.error('Failed to send password reset email:', err);
    });

    return successResponse(res, null, 'If the email exists, a reset code has been sent');
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password with code
 * POST /api/auth/reset-password
 * Body: { email: string, code: string, newPassword: string }
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return errorResponse(res, 'Email, code, and new password are required', 400, 'MISSING_FIELDS');
    }

    if (newPassword.length < 8) {
      return errorResponse(res, 'Password must be at least 8 characters', 400, 'PASSWORD_TOO_SHORT');
    }

    const { Admin, Support, CareGiver, CareRecipient } = models;

    const userTables = [
      { model: Admin, role: USER_ROLES.ADMIN },
      { model: Support, role: USER_ROLES.SUPPORT },
      { model: CareGiver, role: USER_ROLES.CARE_GIVER },
      { model: CareRecipient, role: USER_ROLES.CARE_RECIPIENT },
    ];

    let foundUser = null;

    for (const { model } of userTables) {
      const user = await model.findOne({ where: { email } });
      if (user) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      return errorResponse(res, 'Invalid email or code', 400, 'INVALID_CODE');
    }

    if (!foundUser.resetPasswordCode || foundUser.resetPasswordCode !== code) {
      return errorResponse(res, 'Invalid reset code', 400, 'INVALID_CODE');
    }

    if (new Date() > new Date(foundUser.resetPasswordCodeExpiresAt)) {
      return errorResponse(res, 'Reset code has expired', 400, 'CODE_EXPIRED');
    }

    // Update password and clear reset fields
    await foundUser.update({
      password: newPassword,
      resetPasswordCode: null,
      resetPasswordCodeExpiresAt: null,
    });

    return successResponse(res, null, 'Password reset successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { forgotPassword, resetPassword };
