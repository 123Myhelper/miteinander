// Barrel: recipient handlers split into recipient*.js to keep files < 200 lines.
// Public interface (exported handler names) is unchanged.
module.exports = {
  ...require('./recipientSearch'),
  ...require('./recipientProfileView'),
  ...require('./recipientProfile'),
  ...require('./recipientAccount'),
  ...require('./recipientSettlement'),
};
