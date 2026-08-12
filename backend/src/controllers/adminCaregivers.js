const { models, successResponse, errorResponse, getPagination, getPagingData, Op, config, Admin, Support, CareGiver, CareRecipient, CareNeed, Review, SettlementRequest, sequelize, getStripe } = require('./adminShared');

/**
 * Get all care givers with pagination
 */
const getAllCareGivers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive, isVerified } = req.query;
    const { limit: limitVal, offset } = getPagination(page, limit);

    const where = {};
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    if (isVerified !== undefined) {
      where.isVerified = isVerified === 'true';
    }

    const data = await CareGiver.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: limitVal,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, getPagingData(data, page, limitVal), 'Care givers retrieved successfully');
  } catch (error) {
    console.error('Get care givers error:', error);
    return errorResponse(res, 'Failed to retrieve care givers', 500, 'FETCH_ERROR');
  }
};

/**
 * Get care giver by ID
 */
const getCareGiverById = async (req, res) => {
  try {
    const { id } = req.params;
    const careGiver = await CareGiver.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    if (!careGiver) {
      return errorResponse(res, 'Care giver not found', 404, 'NOT_FOUND');
    }

    return successResponse(res, careGiver, 'Care giver retrieved successfully');
  } catch (error) {
    console.error('Get care giver error:', error);
    return errorResponse(res, 'Failed to retrieve care giver', 500, 'FETCH_ERROR');
  }
};

/**
 * Update care giver
 */
const updateCareGiver = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const careGiver = await CareGiver.findByPk(id);
    if (!careGiver) {
      return errorResponse(res, 'Care giver not found', 404, 'NOT_FOUND');
    }

    delete updates.password;
    delete updates.id;

    await careGiver.update(updates);

    const updatedCareGiver = await CareGiver.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    return successResponse(res, updatedCareGiver, 'Care giver updated successfully');
  } catch (error) {
    console.error('Update care giver error:', error);
    return errorResponse(res, 'Failed to update care giver', 500, 'UPDATE_ERROR');
  }
};

/**
 * Delete care giver
 */
const deleteCareGiver = async (req, res) => {
  try {
    const { id } = req.params;
    
    const careGiver = await CareGiver.findByPk(id);
    if (!careGiver) {
      return errorResponse(res, 'Care giver not found', 404, 'NOT_FOUND');
    }

    await careGiver.destroy();

    return successResponse(res, null, 'Care giver deleted successfully');
  } catch (error) {
    console.error('Delete care giver error:', error);
    return errorResponse(res, 'Failed to delete care giver', 500, 'DELETE_ERROR');
  }
};

module.exports = { getAllCareGivers, getCareGiverById, updateCareGiver, deleteCareGiver };
