// Barrel: message handlers split into message*.js to keep files < 200 lines.
// Public interface (exported handler names) is unchanged.
module.exports = {
  ...require('./messageConversations'),
  ...require('./messageThread'),
  ...require('./messageMisc'),
};
