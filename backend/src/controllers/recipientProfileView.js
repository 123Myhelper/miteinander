const { models, Op, successResponse, errorResponse, CareGiver, CareNeed, CareRecipient, SettlementRequest, resolveSkills } = require('./recipientShared');

/**
 * Get a single caregiver's public profile
 * 
 * SECURITY:
 * - Only authenticated care_recipients can access
 * - Limited data exposure - no sensitive info
 */
const getCaregiverProfile = async (req, res, next) => {
  try {
    const caregiverId = parseInt(req.params.id);
    
    if (isNaN(caregiverId)) {
      return errorResponse(res, 'Invalid caregiver ID', 400, 'INVALID_ID');
    }
    
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
    
    const caregiver = await CareGiver.findOne({
      where: {
        id: caregiverId,
        isActive: true,
      },
      attributes: [
        'id',
        'firstName',
        'lastName',
        'address',
        'postalCode',
        'country',
        'skills',
        'bio',
        'experienceYears',
        'occupation',
        'profileImageUrl',
        'rating',
        'reviewCount',
        'isVerified',
        'createdAt',
      ],
    });
    
    if (!caregiver) {
      return errorResponse(res, 'Caregiver not found', 404, 'CAREGIVER_NOT_FOUND');
    }
    
    // Safely parse certifications
    let certifications = [];
    if (caregiver.certifications) {
      try {
        certifications = JSON.parse(caregiver.certifications);
      } catch {
        certifications = caregiver.certifications ? [caregiver.certifications] : [];
      }
    }
    
    return successResponse(res, {
      caregiver: {
        id: caregiver.id,
        firstName: caregiver.firstName,
        lastName: caregiver.lastName?.charAt(0) + '.', // Privacy: only initial
        address: caregiver.address,
        postalCode: caregiver.postalCode,
        country: caregiver.country,
        skills: resolveSkills(caregiver.skills, careNeedsMap),
        bio: caregiver.bio,
        experienceYears: caregiver.experienceYears,
        occupation: caregiver.occupation,
        certifications,
        profileImageUrl: caregiver.profileImageUrl,
        rating: caregiver.rating,
        reviewCount: caregiver.reviewCount,
        isVerified: caregiver.isVerified,
        memberSince: caregiver.createdAt,
      },
    }, 'Caregiver profile retrieved successfully');
    
  } catch (error) {
    next(error);
  }
};

/**
 * Get available filter options (countries, skills)
 */
const getFilterOptions = async (req, res, next) => {
  try {
    // Get distinct countries from caregivers
    const countries = await CareGiver.findAll({
      attributes: [[models.sequelize.fn('DISTINCT', models.sequelize.col('country')), 'country']],
      where: { isActive: true, country: { [Op.ne]: null } },
      raw: true,
    });
    
    // Get all care needs/skills from config
    const skills = await CareNeed.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']],
    });
    
    return successResponse(res, {
      countries: countries.map(c => c.country).filter(Boolean).sort(),
      skills: skills.map(cn => ({
        id: cn.id,
        key: cn.key,
        labelEn: cn.labelEn,
        labelDe: cn.labelDe,
        labelFr: cn.labelFr,
      })),
    }, 'Filter options retrieved successfully');
    
  } catch (error) {
    next(error);
  }
};

module.exports = { getCaregiverProfile, getFilterOptions };
