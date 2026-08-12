const models = require('../models');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse, USER_ROLES, getModelByRole } = require('../utils/helpers');
const { generateVerificationCode, sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendNewRegistrationNotification } = require('../utils/email');

const { CareNeed } = models;

module.exports = { models, generateToken, successResponse, errorResponse, USER_ROLES, getModelByRole, generateVerificationCode, sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendNewRegistrationNotification, CareNeed };
