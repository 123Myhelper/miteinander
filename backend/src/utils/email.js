// Barrel: email senders split into email*.js to keep files < 200 lines.
// Public interface (exported function names) is unchanged.
module.exports = {
  ...require('./emailVerification'),
  ...require('./emailWelcome'),
  ...require('./emailTicketClosed'),
  ...require('./emailTicketAssigned'),
  ...require('./emailPasswordReset'),
  ...require('./emailTrial'),
  ...require('./emailFeedback'),
  ...require('./emailRegistration'),
};
