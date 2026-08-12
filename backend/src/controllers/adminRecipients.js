const { models, successResponse, errorResponse, getPagination, getPagingData, Op, config, Admin, Support, CareGiver, CareRecipient, CareNeed, Review, SettlementRequest, sequelize, getStripe } = require('./adminShared');

/**
 * Get all care recipients with pagination
 */
const getAllCareRecipients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
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

    const data = await CareRecipient.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: limitVal,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, getPagingData(data, page, limitVal), 'Care recipients retrieved successfully');
  } catch (error) {
    console.error('Get care recipients error:', error);
    return errorResponse(res, 'Failed to retrieve care recipients', 500, 'FETCH_ERROR');
  }
};

/**
 * Get care recipient by ID
 */
const getCareRecipientById = async (req, res) => {
  try {
    const { id } = req.params;
    const careRecipient = await CareRecipient.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    if (!careRecipient) {
      return errorResponse(res, 'Care recipient not found', 404, 'NOT_FOUND');
    }

    return successResponse(res, careRecipient, 'Care recipient retrieved successfully');
  } catch (error) {
    console.error('Get care recipient error:', error);
    return errorResponse(res, 'Failed to retrieve care recipient', 500, 'FETCH_ERROR');
  }
};

/**
 * Update care recipient
 */
const updateCareRecipient = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const careRecipient = await CareRecipient.findByPk(id);
    if (!careRecipient) {
      return errorResponse(res, 'Care recipient not found', 404, 'NOT_FOUND');
    }

    delete updates.password;
    delete updates.id;

    await careRecipient.update(updates);

    const updatedCareRecipient = await CareRecipient.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    return successResponse(res, updatedCareRecipient, 'Care recipient updated successfully');
  } catch (error) {
    console.error('Update care recipient error:', error);
    return errorResponse(res, 'Failed to update care recipient', 500, 'UPDATE_ERROR');
  }
};

/**
 * Delete care recipient
 */
const deleteCareRecipient = async (req, res) => {
  try {
    const { id } = req.params;
    
    const careRecipient = await CareRecipient.findByPk(id);
    if (!careRecipient) {
      return errorResponse(res, 'Care recipient not found', 404, 'NOT_FOUND');
    }

    await careRecipient.destroy();

    return successResponse(res, null, 'Care recipient deleted successfully');
  } catch (error) {
    console.error('Delete care recipient error:', error);
    return errorResponse(res, 'Failed to delete care recipient', 500, 'DELETE_ERROR');
  }
};

module.exports = { getAllCareRecipients, getCareRecipientById, updateCareRecipient, deleteCareRecipient };
