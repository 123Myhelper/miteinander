// Barrel: caregiver handlers split into caregiver*.js to keep files < 200 lines.
// Public interface (exported handler names) is unchanged.
module.exports = {
  ...require('./caregiverSearch'),
  ...require('./caregiverClientView'),
  ...require('./caregiverProfile'),
  ...require('./caregiverAccount'),
  ...require('./caregiverSettledView'),
  ...require('./caregiverSettlement'),
};
