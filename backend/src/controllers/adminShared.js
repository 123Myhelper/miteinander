const models = require('../models');
const { successResponse, errorResponse, getPagination, getPagingData } = require('../utils/helpers');
const { Op } = require('sequelize');
const config = require('../config/config');

const { Admin, Support, CareGiver, CareRecipient, CareNeed, Review, SettlementRequest, sequelize } = models;

// Lazy-init Stripe only when needed
let _stripe = null;
const getStripe = () => {
  if (!_stripe && config.stripe.secretKey) {
    _stripe = require('stripe')(config.stripe.secretKey);
  }
  return _stripe;
};

module.exports = { models, successResponse, errorResponse, getPagination, getPagingData, Op, config, Admin, Support, CareGiver, CareRecipient, CareNeed, Review, SettlementRequest, sequelize, getStripe };
