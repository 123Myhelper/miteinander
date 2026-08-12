const models = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/helpers');

const { CareRecipient, CareNeed, CareGiver, Review, SettlementRequest, Notification } = models;
const { createRatingNotification } = require('./notificationController');

/**
 * Helper to resolve care need IDs to their full data
 * @param {number[]} ids - Array of care need IDs
 * @param {Object} careNeedsMap - Map of care need ID to care need data
 * @returns {Object[]} - Array of resolved care need objects with id, key, and labels
 */
const resolveCareNeeds = (ids, careNeedsMap) => {
  if (!Array.isArray(ids)) return [];
  return ids
    .map(id => careNeedsMap[id])
    .filter(Boolean);
};

module.exports = { models, Op, successResponse, errorResponse, CareRecipient, CareNeed, CareGiver, Review, SettlementRequest, Notification, createRatingNotification, resolveCareNeeds };
