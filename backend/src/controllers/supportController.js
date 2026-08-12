// Barrel: support-ticket handlers split into supportTicket*.js to keep files < 200 lines.
// Public interface (exported handler names) is unchanged.
module.exports = {
  ...require('./supportTicketRead'),
  ...require('./supportTicketSend'),
  ...require('./supportTicketList'),
  ...require('./supportTicketAssign'),
};
