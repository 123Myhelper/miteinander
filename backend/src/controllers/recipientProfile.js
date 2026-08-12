const { models, Op, successResponse, errorResponse, CareGiver, CareNeed, CareRecipient, SettlementRequest, resolveSkills } = require('./recipientShared');

/**
 * Get the current recipient's own profile
 * 
 * SECURITY:
 * - Only authenticated care_recipients can access their own profile
 * - Returns full profile data (not public view)
 */
const getMyProfile = async (req, res, next) => {
  try {
    const recipientId = req.user.id;
    
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
    
    const recipient = await CareRecipient.findByPk(recipientId, {
      attributes: [
        'id',
        'email',
        'firstName',
        'lastName',
        'phone',
        'dateOfBirth',
        'address',
        'postalCode',
        'country',
        'bio',
        'careNeeds',
        'profileImageUrl',
        'isSettled',
        'settledWithCaregiverId',
        'settledAt',
        'createdAt',
      ],
    });
    
    if (!recipient) {
      return errorResponse(res, 'Profile not found', 404, 'PROFILE_NOT_FOUND');
    }
    
    // If settled, fetch the caregiver name
    let settledWithCaregiver = null;
    if (recipient.isSettled && recipient.settledWithCaregiverId) {
      const cg = await CareGiver.findByPk(recipient.settledWithCaregiverId, {
        attributes: ['id', 'firstName', 'lastName', 'email', 'profileImageUrl'],
      });
      if (cg) {
        settledWithCaregiver = {
          id: cg.id,
          firstName: cg.firstName,
          lastName: cg.lastName,
          email: cg.email,
          profileImageUrl: cg.profileImageUrl,
        };
      }
    }

    // Check for pending settlement request
    let pendingSettlementRequest = null;
    if (!recipient.isSettled) {
      const pending = await SettlementRequest.findOne({
        where: { careRecipientId: recipientId, status: 'pending' },
        include: [{
          model: CareGiver,
          as: 'careGiver',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImageUrl'],
        }],
      });
      if (pending) {
        pendingSettlementRequest = {
          id: pending.id,
          status: pending.status,
          createdAt: pending.createdAt,
          caregiver: pending.careGiver ? {
            id: pending.careGiver.id,
            firstName: pending.careGiver.firstName,
            lastName: pending.careGiver.lastName,
            email: pending.careGiver.email,
            profileImageUrl: pending.careGiver.profileImageUrl,
          } : null,
        };
      }
    }
    
    return successResponse(res, {
      profile: {
        id: recipient.id,
        email: recipient.email,
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        phone: recipient.phone,
        dateOfBirth: recipient.dateOfBirth,
        address: recipient.address,
        postalCode: recipient.postalCode,
        country: recipient.country,
        bio: recipient.bio,
        careNeeds: resolveSkills(recipient.careNeeds, careNeedsMap),
        profileImageUrl: recipient.profileImageUrl,
        isSettled: recipient.isSettled,
        settledWithCaregiver,
        settledAt: recipient.settledAt,
        pendingSettlementRequest,
        memberSince: recipient.createdAt,
      },
    }, 'Profile retrieved successfully');
    
  } catch (error) {
    next(error);
  }
};

/**
 * Update the current recipient's profile
 * 
 * SECURITY:
 * - Only authenticated care_recipients can update their own profile
 * - Cannot update email or password through this endpoint
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const recipientId = req.user.id;
    
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'dateOfBirth',
      'address', 'postalCode', 'country', 'bio', 
      'careNeeds', 'profileImageUrl'
    ];
    
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Validate: at least 1 care need required
    if (updates.careNeeds !== undefined) {
      const needsArr = Array.isArray(updates.careNeeds) ? updates.careNeeds : [];
      if (needsArr.length === 0) {
        return errorResponse(res, 'At least one care need is required', 400, 'MIN_CARE_NEEDS');
      }
    }
    
    await CareRecipient.update(updates, {
      where: { id: recipientId },
    });
    
    return successResponse(res, null, 'Profile updated successfully');
    
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyProfile, updateMyProfile };
