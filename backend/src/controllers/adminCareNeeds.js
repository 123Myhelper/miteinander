const { models, successResponse, errorResponse, getPagination, getPagingData, Op, config, Admin, Support, CareGiver, CareRecipient, CareNeed, Review, SettlementRequest, sequelize, getStripe } = require('./adminShared');

/**
 * Get all care needs
 */
const getAllCareNeeds = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    
    const where = {};
    if (includeInactive !== 'true') {
      where.isActive = true;
    }

    const careNeeds = await CareNeed.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['labelEn', 'ASC']],
    });

    return successResponse(res, careNeeds, 'Care needs retrieved successfully');
  } catch (error) {
    console.error('Get care needs error:', error);
    return errorResponse(res, 'Failed to retrieve care needs', 500, 'FETCH_ERROR');
  }
};

/**
 * Create care need
 */
const createCareNeed = async (req, res) => {
  try {
    const { labelEn, labelDe, labelFr, descriptionEn, descriptionDe, descriptionFr, icon, sortOrder } = req.body;

    if (!labelEn || !labelDe || !labelFr) {
      return errorResponse(res, 'All language labels are required', 400, 'VALIDATION_ERROR');
    }

    const careNeed = await CareNeed.create({
      labelEn,
      labelDe,
      labelFr,
      descriptionEn,
      descriptionDe,
      descriptionFr,
      icon,
      sortOrder: sortOrder || 0,
      createdBy: req.user?.id,
    });

    return successResponse(res, careNeed, 'Care need created successfully', 201);
  } catch (error) {
    console.error('Create care need error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return errorResponse(res, 'A care need with this key already exists', 400, 'DUPLICATE_KEY');
    }
    return errorResponse(res, 'Failed to create care need', 500, 'CREATE_ERROR');
  }
};

/**
 * Update care need
 */
const updateCareNeed = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const careNeed = await CareNeed.findByPk(id);
    if (!careNeed) {
      return errorResponse(res, 'Care need not found', 404, 'NOT_FOUND');
    }

    updates.updatedBy = req.user?.id;
    delete updates.id;
    delete updates.key; // Don't allow key changes

    await careNeed.update(updates);

    return successResponse(res, careNeed, 'Care need updated successfully');
  } catch (error) {
    console.error('Update care need error:', error);
    return errorResponse(res, 'Failed to update care need', 500, 'UPDATE_ERROR');
  }
};

/**
 * Delete care need
 */
const deleteCareNeed = async (req, res) => {
  try {
    const { id } = req.params;
    
    const careNeed = await CareNeed.findByPk(id);
    if (!careNeed) {
      return errorResponse(res, 'Care need not found', 404, 'NOT_FOUND');
    }

    await careNeed.destroy();

    return successResponse(res, null, 'Care need deleted successfully');
  } catch (error) {
    console.error('Delete care need error:', error);
    return errorResponse(res, 'Failed to delete care need', 500, 'DELETE_ERROR');
  }
};

/**
 * Toggle care need active status
 */
const toggleCareNeed = async (req, res) => {
  try {
    const { id } = req.params;

    const careNeed = await CareNeed.findByPk(id);
    if (!careNeed) {
      return errorResponse(res, 'Care need not found', 404, 'NOT_FOUND');
    }

    await careNeed.update({
      isActive: !careNeed.isActive,
      updatedBy: req.user?.id,
    });

    return successResponse(res, careNeed, 'Care need toggled successfully');
  } catch (error) {
    console.error('Toggle care need error:', error);
    return errorResponse(res, 'Failed to toggle care need', 500, 'TOGGLE_ERROR');
  }
};

module.exports = { getAllCareNeeds, createCareNeed, updateCareNeed, deleteCareNeed, toggleCareNeed };
