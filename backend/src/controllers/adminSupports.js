const { models, successResponse, errorResponse, getPagination, getPagingData, Op, config, Admin, Support, CareGiver, CareRecipient, CareNeed, Review, SettlementRequest, sequelize, getStripe } = require('./adminShared');

/**
 * Create a new support employee
 */
const createSupport = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, department } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return errorResponse(res, 'First name, last name, email, and password are required', 400, 'VALIDATION_ERROR');
    }

    // Check for duplicate email
    const existing = await Support.findOne({ where: { email } });
    if (existing) {
      return errorResponse(res, 'A support employee with this email already exists', 409, 'DUPLICATE_EMAIL');
    }

    // Create support (password hashed via model beforeCreate hook)
    const support = await Support.create({
      firstName,
      lastName,
      email,
      password,
      phone: phone || null,
      department: department || null,
    });

    // Return without password
    const created = await Support.findByPk(support.id, {
      attributes: { exclude: ['password'] },
    });

    return successResponse(res, created, 'Support employee created successfully', 201);
  } catch (error) {
    console.error('Create support error:', error);
    return errorResponse(res, 'Failed to create support employee', 500, 'CREATE_ERROR');
  }
};

/**
 * Get all support employees with pagination
 */
const getAllSupports = async (req, res) => {
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

    const data = await Support.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: limitVal,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, getPagingData(data, page, limitVal), 'Supports retrieved successfully');
  } catch (error) {
    console.error('Get supports error:', error);
    return errorResponse(res, 'Failed to retrieve supports', 500, 'FETCH_ERROR');
  }
};

/**
 * Get support by ID
 */
const getSupportById = async (req, res) => {
  try {
    const { id } = req.params;
    const support = await Support.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    if (!support) {
      return errorResponse(res, 'Support not found', 404, 'NOT_FOUND');
    }

    return successResponse(res, support, 'Support retrieved successfully');
  } catch (error) {
    console.error('Get support error:', error);
    return errorResponse(res, 'Failed to retrieve support', 500, 'FETCH_ERROR');
  }
};

/**
 * Update support
 */
const updateSupport = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const support = await Support.findByPk(id);
    if (!support) {
      return errorResponse(res, 'Support not found', 404, 'NOT_FOUND');
    }

    // Remove sensitive fields from updates
    delete updates.password;
    delete updates.id;

    await support.update(updates);

    const updatedSupport = await Support.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    return successResponse(res, updatedSupport, 'Support updated successfully');
  } catch (error) {
    console.error('Update support error:', error);
    return errorResponse(res, 'Failed to update support', 500, 'UPDATE_ERROR');
  }
};

/**
 * Delete support
 */
const deleteSupport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const support = await Support.findByPk(id);
    if (!support) {
      return errorResponse(res, 'Support not found', 404, 'NOT_FOUND');
    }

    await support.destroy();

    return successResponse(res, null, 'Support deleted successfully');
  } catch (error) {
    console.error('Delete support error:', error);
    return errorResponse(res, 'Failed to delete support', 500, 'DELETE_ERROR');
  }
};

module.exports = { createSupport, getAllSupports, getSupportById, updateSupport, deleteSupport };
