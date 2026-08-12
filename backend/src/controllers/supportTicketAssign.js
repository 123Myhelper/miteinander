const { Op, models, successResponse, errorResponse, sendTicketClosedEmail, sendTicketAssignedEmail } = require('./supportShared');

/**
 * Assign a ticket to a support staff member (admin only)
 * PUT /api/support/tickets/:ticketId/assign
 */
const assignTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { supportId } = req.body;
    const role = req.userRole;

    if (role !== 'admin') {
      return errorResponse(res, 'Only admins can assign tickets', 403);
    }

    const ticket = await models.SupportTicket.findByPk(ticketId);
    if (!ticket) return errorResponse(res, 'Ticket not found', 404);

    if (ticket.status === 'closed') {
      return errorResponse(res, 'Cannot assign a closed ticket', 400);
    }

    // If supportId is null, unassign the ticket
    if (!supportId) {
      await ticket.update({
        status: 'open',
        assignedToRole: null,
        assignedToId: null,
      });

      // Notify via socket
      try {
        const { getIO } = require('../socket');
        const io = getIO();
        const payload = {
          ticketId: parseInt(ticketId),
          ticket: ticket.toJSON(),
        };
        io.to('support_agents').to('admin_agents').emit('support_ticket_assigned', payload);
        // Also notify the ticket user
        const userKey = `${ticket.userRole}:${ticket.userId}`;
        io.to(userKey).emit('support_ticket_assigned', payload);
      } catch (socketErr) {
        console.error('Socket emit error:', socketErr);
      }

      return successResponse(res, { ticket: ticket.toJSON() }, 'Ticket unassigned');
    }

    // Verify the support user exists and is active
    const support = await models.Support.findByPk(supportId, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'isActive'],
    });
    if (!support) return errorResponse(res, 'Support staff not found', 404);
    if (!support.isActive) return errorResponse(res, 'Support staff is inactive', 400);

    await ticket.update({
      status: 'assigned',
      assignedToRole: 'support',
      assignedToId: supportId,
    });

    // Send ticket assigned email to the support staff (non-blocking)
    try {
      const UserModel = ticket.userRole === 'care_giver' ? models.CareGiver : models.CareRecipient;
      const ticketUser = await UserModel.findByPk(ticket.userId, {
        attributes: ['firstName', 'lastName'],
      });
      const userName = ticketUser ? `${ticketUser.firstName} ${ticketUser.lastName}` : 'Unbekannt';
      sendTicketAssignedEmail(support.email, support.firstName, ticket.id, userName).catch((err) => {
        console.error('Failed to send ticket assigned email:', err);
      });
    } catch (emailErr) {
      console.error('Error preparing ticket assigned email:', emailErr);
    }

    // Notify via socket
    try {
      const { getIO } = require('../socket');
      const io = getIO();

      const payload = {
        ticketId: parseInt(ticketId),
        ticket: ticket.toJSON(),
        assignedTo: support.toJSON(),
      };

      // Notify all support agents and admins (assigned agent is in support_agents room)
      io.to('support_agents').to('admin_agents').emit('support_ticket_assigned', payload);

      // Also notify the ticket user
      const userKey = `${ticket.userRole}:${ticket.userId}`;
      io.to(userKey).emit('support_ticket_assigned', payload);
    } catch (socketErr) {
      console.error('Socket emit error:', socketErr);
    }

    return successResponse(res, { ticket: ticket.toJSON(), assignedTo: support.toJSON() }, 'Ticket assigned');
  } catch (error) {
    console.error('assignTicket error:', error);
    return errorResponse(res, 'Failed to assign ticket', 500);
  }
};

/**
 * Get all active support staff (for assignment dropdown)
 * GET /api/support/staff
 */
const getActiveStaff = async (req, res) => {
  try {
    const role = req.userRole;
    if (role !== 'admin') {
      return errorResponse(res, 'Access denied', 403);
    }

    const staff = await models.Support.findAll({
      where: { isActive: true },
      attributes: ['id', 'firstName', 'lastName', 'email'],
      order: [['firstName', 'ASC'], ['lastName', 'ASC']],
    });

    return successResponse(res, { staff });
  } catch (error) {
    console.error('getActiveStaff error:', error);
    return errorResponse(res, 'Failed to get staff', 500);
  }
};

module.exports = { assignTicket, getActiveStaff };
