const { models, Op, successResponse, errorResponse, CareRecipient, CareNeed, CareGiver, Review, SettlementRequest, Notification, createRatingNotification, resolveCareNeeds } = require('./caregiverShared');

/**
 * Update caregiver's email
 * 
 * SECURITY:
 * - Requires current password verification
 */
const updateEmail = async (req, res, next) => {
  try {
    const caregiverId = req.user.id;
    const { currentPassword, newEmail } = req.body;
    
    if (!currentPassword || !newEmail) {
      return errorResponse(res, 'Current password and new email are required', 400, 'MISSING_FIELDS');
    }
    
    const { CareGiver } = models;
    const caregiver = await CareGiver.findByPk(caregiverId);
    
    if (!caregiver) {
      return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Verify current password
    const isValidPassword = await caregiver.validatePassword(currentPassword);
    if (!isValidPassword) {
      return errorResponse(res, 'Current password is incorrect', 401, 'INVALID_PASSWORD');
    }
    
    // Check if email is already in use
    const existingUser = await CareGiver.findOne({ where: { email: newEmail } });
    if (existingUser && existingUser.id !== caregiverId) {
      return errorResponse(res, 'Email is already in use', 400, 'EMAIL_IN_USE');
    }
    
    await CareGiver.update({ email: newEmail }, { where: { id: caregiverId } });
    
    return successResponse(res, null, 'Email updated successfully');
    
  } catch (error) {
    next(error);
  }
};

/**
 * Update caregiver's password
 * 
 * SECURITY:
 * - Requires current password verification
 */
const updatePassword = async (req, res, next) => {
  try {
    const caregiverId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current password and new password are required', 400, 'MISSING_FIELDS');
    }
    
    if (newPassword.length < 8) {
      return errorResponse(res, 'New password must be at least 8 characters', 400, 'PASSWORD_TOO_SHORT');
    }
    
    const { CareGiver } = models;
    const caregiver = await CareGiver.findByPk(caregiverId);
    
    if (!caregiver) {
      return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Verify current password
    const isValidPassword = await caregiver.validatePassword(currentPassword);
    if (!isValidPassword) {
      return errorResponse(res, 'Current password is incorrect', 401, 'INVALID_PASSWORD');
    }
    
    // Update password (will be hashed by model hook)
    caregiver.password = newPassword;
    await caregiver.save();
    
    return successResponse(res, null, 'Password updated successfully');
    
  } catch (error) {
    next(error);
  }
};

/**
 * Get care recipients settled with this caregiver ("My Clients")
 */
const getMySettledClients = async (req, res, next) => {
  try {
    const caregiverId = req.user.id;
    
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
    
    const settledClients = await CareRecipient.findAll({
      where: {
        isSettled: true,
        settledWithCaregiverId: caregiverId,
        isActive: true,
      },
      attributes: [
        'id', 'firstName', 'lastName', 'email', 'phone',
        'address', 'postalCode', 'country', 'careNeeds',
        'bio', 'profileImageUrl', 'settledAt', 'createdAt',
      ],
      order: [['settledAt', 'DESC']],
    });
    
    return successResponse(res, {
      clients: settledClients.map(client => ({
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        address: client.address,
        postalCode: client.postalCode,
        country: client.country,
        careNeeds: resolveCareNeeds(client.careNeeds, careNeedsMap),
        bio: client.bio,
        profileImageUrl: client.profileImageUrl,
        settledAt: client.settledAt,
        memberSince: client.createdAt,
      })),
    }, 'Settled clients retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { updateEmail, updatePassword, getMySettledClients };
