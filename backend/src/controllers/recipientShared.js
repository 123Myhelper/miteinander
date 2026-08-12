const models = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/helpers');

const { CareGiver, CareNeed, CareRecipient, SettlementRequest } = models;

/**
 * Helper to resolve care need/skill IDs to their full data
 * @param {number[]} ids - Array of care need IDs
 * @param {Object} careNeedsMap - Map of care need ID to care need data
 * @returns {Object[]} - Array of resolved care need objects with id, key, and labels
 */
const resolveSkills = (ids, careNeedsMap) => {
  if (!Array.isArray(ids)) return [];
  return ids
    .map(id => careNeedsMap[id])
    .filter(Boolean);
};

module.exports = { models, Op, successResponse, errorResponse, CareGiver, CareNeed, CareRecipient, SettlementRequest, resolveSkills };
