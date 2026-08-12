const { models, generateToken, successResponse, errorResponse, USER_ROLES, getModelByRole, generateVerificationCode, sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendNewRegistrationNotification, CareNeed } = require('./authShared');

/**
 * Verify email with code
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return errorResponse(res, 'Email and verification code are required', 400, 'MISSING_FIELDS');
    }
    
    const { Admin, Support, CareGiver, CareRecipient } = models;
    
    const userTables = [
      { model: CareGiver, role: USER_ROLES.CARE_GIVER },
      { model: CareRecipient, role: USER_ROLES.CARE_RECIPIENT },
    ];
    
    let foundUser = null;
    let userRole = null;
    
    for (const { model, role } of userTables) {
      const user = await model.findOne({ where: { email } });
      if (user) {
        foundUser = user;
        userRole = role;
        break;
      }
    }
    
    if (!foundUser) {
      return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
    }
    
    if (foundUser.emailVerified) {
      return successResponse(res, { alreadyVerified: true }, 'Email already verified');
    }
    
    if (!foundUser.verificationCode || foundUser.verificationCode !== code) {
      return errorResponse(res, 'Invalid verification code', 400, 'INVALID_CODE');
    }
    
    if (new Date() > new Date(foundUser.verificationCodeExpiresAt)) {
      return errorResponse(res, 'Verification code has expired', 400, 'CODE_EXPIRED');
    }
    
    await foundUser.update({
      emailVerified: true,
      verificationCode: null,
      verificationCodeExpiresAt: null,
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(foundUser.email, foundUser.firstName).catch((err) => {
      console.error('Failed to send welcome email:', err);
    });

    const token = generateToken({
      id: foundUser.id,
      email: foundUser.email,
      role: userRole,
    });
    
    return successResponse(res, {
      user: foundUser.toJSON(),
      token,
      role: userRole,
      subscriptionStatus: foundUser.subscriptionStatus || 'none',
      subscriptionEndsAt: foundUser.subscriptionEndsAt || null,
    }, 'Email verified successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Resend verification code
 */
const resendVerificationCode = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return errorResponse(res, 'Email is required', 400, 'MISSING_FIELDS');
    }
    
    const { CareGiver, CareRecipient } = models;
    
    const userTables = [
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
      // Don't reveal if user exists
      return successResponse(res, null, 'If the email exists, a new code has been sent');
    }
    
    if (foundUser.emailVerified) {
      return successResponse(res, { alreadyVerified: true }, 'Email already verified');
    }
    
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await foundUser.update({
      verificationCode,
      verificationCodeExpiresAt: expiresAt,
    });
    
    await sendVerificationEmail(email, foundUser.firstName, verificationCode);
    
    return successResponse(res, null, 'Verification code sent');
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyEmail, resendVerificationCode };
