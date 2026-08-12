const { models, generateToken, successResponse, errorResponse, USER_ROLES, getModelByRole, generateVerificationCode, sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendNewRegistrationNotification, CareNeed } = require('./authShared');

/**
 * Login user
 * Checks all user tables (Admin, Support, CareGiver, CareRecipient) to find the user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return errorResponse(res, 'Missing required fields: email, password', 400, 'MISSING_FIELDS');
    }
    
    const { Admin, Support, CareGiver, CareRecipient } = models;
    
    // Define the tables to check in order of priority
    const userTables = [
      { model: Admin, role: USER_ROLES.ADMIN },
      { model: Support, role: USER_ROLES.SUPPORT },
      { model: CareGiver, role: USER_ROLES.CARE_GIVER },
      { model: CareRecipient, role: USER_ROLES.CARE_RECIPIENT },
    ];
    
    let foundUser = null;
    let userRole = null;
    
    // Check each table for the user
    for (const { model, role } of userTables) {
      const user = await model.findOne({ where: { email } });
      if (user) {
        foundUser = user;
        userRole = role;
        break;
      }
    }
    
    if (!foundUser) {
      return errorResponse(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }
    
    // Check if account is active
    if (!foundUser.isActive) {
      return errorResponse(res, 'Account is deactivated', 401, 'ACCOUNT_INACTIVE');
    }
    
    // Validate password
    const isValidPassword = await foundUser.validatePassword(password);
    
    if (!isValidPassword) {
      return errorResponse(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }
    
    // Check email verification for care_giver and care_recipient
    if ((userRole === USER_ROLES.CARE_GIVER || userRole === USER_ROLES.CARE_RECIPIENT) && !foundUser.emailVerified) {
      // Resend a new code
      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await foundUser.update({
        verificationCode,
        verificationCodeExpiresAt: expiresAt,
      });
      sendVerificationEmail(foundUser.email, foundUser.firstName, verificationCode).catch(err => {
        console.error('Failed to send verification email:', err);
      });
      
      return errorResponse(res, 'Email not verified. A new verification code has been sent.', 403, 'EMAIL_NOT_VERIFIED');
    }
    
    // Update last login
    await foundUser.update({ lastLoginAt: new Date() });
    
    // Generate token
    const token = generateToken({
      id: foundUser.id,
      email: foundUser.email,
      role: userRole,
    });

    // Platform is currently free (Stripe disabled for now) — never gate login on subscription
    if (userRole === USER_ROLES.CARE_GIVER || userRole === USER_ROLES.CARE_RECIPIENT) {
      return successResponse(res, {
        user: foundUser.toJSON(),
        token,
        role: userRole,
        subscriptionStatus: foundUser.subscriptionStatus || 'active',
        subscriptionEndsAt: foundUser.subscriptionEndsAt || null,
      }, 'Login successful');
    }
    
    return successResponse(res, {
      user: foundUser.toJSON(),
      token,
      role: userRole,
    }, 'Login successful');
    
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
  try {
    return successResponse(res, {
      user: req.user.toJSON(),
      role: req.userRole,
    }, 'Profile retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'phone', 'address', 'city', 'postalCode'];
    const updates = {};
    
    // Only allow specific fields to be updated
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    
    await req.user.update(updates);
    
    return successResponse(res, {
      user: req.user.toJSON(),
    }, 'Profile updated');
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current password and new password are required', 400, 'MISSING_FIELDS');
    }
    
    // Validate current password
    const isValid = await req.user.validatePassword(currentPassword);
    
    if (!isValid) {
      return errorResponse(res, 'Current password is incorrect', 401, 'INVALID_PASSWORD');
    }
    
    // Update password
    await req.user.update({ password: newPassword });
    
    return successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get active care needs (public endpoint)
 */
const getCareNeeds = async (req, res, next) => {
  try {
    const careNeeds = await CareNeed.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']],
    });
    
    return successResponse(res, careNeeds, 'Care needs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getProfile, updateProfile, changePassword, getCareNeeds };
