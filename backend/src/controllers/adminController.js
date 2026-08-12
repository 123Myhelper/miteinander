// Barrel: admin handlers split into admin*.js to keep files < 200 lines.
// Public interface (exported handler names) is unchanged.
module.exports = {
  ...require('./adminAnalytics'),
  ...require('./adminSupports'),
  ...require('./adminCaregivers'),
  ...require('./adminRecipients'),
  ...require('./adminCareNeeds'),
  ...require('./adminUserDetails'),
  ...require('./adminSettlementDetails'),
};
