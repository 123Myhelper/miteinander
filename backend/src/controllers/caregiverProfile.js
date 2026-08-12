const { models, Op, successResponse, errorResponse, CareRecipient, CareNeed, CareGiver, Review, SettlementRequest, Notification, createRatingNotification, resolveCareNeeds } = require('./caregiverShared');

/**
 * Get the current caregiver's own profile
 * 
 * SECURITY:
 * - Only authenticated care_givers can access their own profile
 * - Returns full profile data (not public view)
 */
const getMyProfile = async (req, res, next) => {
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
    
    const { CareGiver } = models;
    const caregiver = await CareGiver.findByPk(caregiverId, {
      attributes: [
        'id',
        'email',
        'firstName',
        'lastName',
        'phone',
        'dateOfBirth',
        'address',
        'postalCode',
        'bio',
        'skills',
        'certifications',
        'experienceYears',
        'occupation',
        'profileImageUrl',
        'rating',
        'reviewCount',
        'createdAt',
      ],
    });
    
    if (!caregiver) {
      return errorResponse(res, 'Profile not found', 404, 'PROFILE_NOT_FOUND');
    }
    
    // Safely parse certifications
    let certifications = [];
    if (caregiver.certifications) {
      try {
        certifications = JSON.parse(caregiver.certifications);
      } catch {
        // If not valid JSON, treat as single item or empty
        certifications = caregiver.certifications ? [caregiver.certifications] : [];
      }
    }
    
    return successResponse(res, {
      profile: {
        id: caregiver.id,
        email: caregiver.email,
        firstName: caregiver.firstName,
        lastName: caregiver.lastName,
        phone: caregiver.phone,
        dateOfBirth: caregiver.dateOfBirth,
        address: caregiver.address,
        postalCode: caregiver.postalCode,
        bio: caregiver.bio,
        skills: resolveCareNeeds(caregiver.skills, careNeedsMap),
        certifications,
        experienceYears: caregiver.experienceYears,
        occupation: caregiver.occupation,
        profileImageUrl: caregiver.profileImageUrl,
        rating: caregiver.rating,
        reviewCount: caregiver.reviewCount,
        memberSince: caregiver.createdAt,
      },
    }, 'Profile retrieved successfully');
    
  } catch (error) {
    next(error);
  }
};

/**
 * Update the current caregiver's profile
 * 
 * SECURITY:
 * - Only authenticated care_givers can update their own profile
 * - Cannot update email or password through this endpoint
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const caregiverId = req.user.id;
    const { CareGiver } = models;
    
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'dateOfBirth',
      'address', 'postalCode', 'bio', 'skills',
      'experienceYears', 'occupation', 'profileImageUrl', 'certifications'
    ];
    
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Validate: at least 1 skill required
    if (updates.skills !== undefined) {
      const skillsArr = Array.isArray(updates.skills) ? updates.skills : [];
      if (skillsArr.length === 0) {
        return errorResponse(res, 'At least one skill is required', 400, 'MIN_SKILLS');
      }
    }
    
    await CareGiver.update(updates, {
      where: { id: caregiverId },
    });
    
    return successResponse(res, null, 'Profile updated successfully');
    
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyProfile, updateMyProfile };
