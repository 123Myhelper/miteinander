const { models, generateToken, successResponse, errorResponse, USER_ROLES, getModelByRole, generateVerificationCode, sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendNewRegistrationNotification, CareNeed } = require('./authShared');

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, ...additionalData } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return errorResponse(res, 'Missing required fields: email, password, firstName, lastName, role', 400, 'MISSING_FIELDS');
    }
    
    // Validate role
    const validRoles = [USER_ROLES.CARE_GIVER, USER_ROLES.CARE_RECIPIENT];
    if (!validRoles.includes(role)) {
      return errorResponse(res, 'Invalid role. Must be care_giver or care_recipient', 400, 'INVALID_ROLE');
    }
    
    // Get the appropriate model
    const Model = getModelByRole(role, models);
    
    if (!Model) {
      return errorResponse(res, 'Invalid user type', 400, 'INVALID_USER_TYPE');
    }
    
    // Check if email already exists across ALL user tables
    const { Admin, Support, CareGiver, CareRecipient } = models;
    const allTables = [
      { model: Admin, name: 'admin' },
      { model: Support, name: 'support' },
      { model: CareGiver, name: 'care_giver' },
      { model: CareRecipient, name: 'care_recipient' },
    ];
    
    for (const { model } of allTables) {
      const existingByEmail = await model.findOne({ where: { email } });
      if (existingByEmail) {
        return errorResponse(res, 'Email already registered', 409, 'EMAIL_EXISTS');
      }
    }
    
    // Check if phone already exists across ALL user tables (if phone provided)
    const phone = additionalData.phone;
    if (phone) {
      for (const { model } of allTables) {
        const existingByPhone = await model.findOne({ where: { phone } });
        if (existingByPhone) {
          return errorResponse(res, 'Phone number already registered', 409, 'PHONE_EXISTS');
        }
      }
    }
    
    // Validate role-specific required fields and resolve care need keys → IDs
    if (role === USER_ROLES.CARE_GIVER) {
      const skills = additionalData.skills;
      if (!skills || !Array.isArray(skills) || skills.length === 0) {
        return errorResponse(res, 'At least one skill is required', 400, 'MIN_SKILLS');
      }
      // Resolve string keys to integer IDs
      const careNeedRecords = await CareNeed.findAll({
        where: { key: skills, isActive: true },
        attributes: ['id', 'key'],
      });
      if (careNeedRecords.length === 0) {
        return errorResponse(res, 'No valid skills found', 400, 'INVALID_SKILLS');
      }
      additionalData.skills = careNeedRecords.map(r => r.id);
    }
    if (role === USER_ROLES.CARE_RECIPIENT) {
      const careNeeds = additionalData.careNeeds;
      if (!careNeeds || !Array.isArray(careNeeds) || careNeeds.length === 0) {
        return errorResponse(res, 'At least one care need is required', 400, 'MIN_CARE_NEEDS');
      }
      // Resolve string keys to integer IDs
      const careNeedRecords = await CareNeed.findAll({
        where: { key: careNeeds, isActive: true },
        attributes: ['id', 'key'],
      });
      if (careNeedRecords.length === 0) {
        return errorResponse(res, 'No valid care needs found', 400, 'INVALID_CARE_NEEDS');
      }
      additionalData.careNeeds = careNeedRecords.map(r => r.id);
    }

    // Create user
    const userData = {
      email,
      password,
      firstName,
      lastName,
      ...additionalData,
    };

    // Platform is currently free (Stripe disabled for now) — grant access on registration
    userData.subscriptionStatus = 'active';

    const user = await Model.create(userData);
    
    // Generate and send email verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await user.update({
      verificationCode,
      verificationCodeExpiresAt: expiresAt,
    });
    
    // Send verification email (don't block registration on email failure)
    sendVerificationEmail(email, firstName, verificationCode).catch(err => {
      console.error('Failed to send verification email:', err);
    });

    // Notify the platform operator of the new registration (don't block on failure)
    sendNewRegistrationNotification({ firstName, lastName, email, role }).catch(err => {
      console.error('Failed to send new-registration notification:', err);
    });
    
    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role,
    });
    
    return successResponse(res, {
      user: user.toJSON(),
      token,
      role,
      emailVerificationRequired: true,
    }, 'Registration successful. Please verify your email.', 201);
    
  } catch (error) {
    next(error);
  }
};

module.exports = { register };
