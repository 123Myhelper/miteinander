const { Op, models, successResponse, errorResponse, sendTicketClosedEmail, sendTicketAssignedEmail } = require('./supportShared');

/**
 * Get all tickets (for admin/support)
 * Admin sees all. Support sees open + their assigned.
 * 
 * GET /api/support/tickets
 */
const getTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.userRole;

    let whereClause;
    if (role === 'admin') {
      whereClause = {}; // Admin sees all
    } else if (role === 'support') {
      whereClause = {
        [Op.or]: [
          { status: 'open' },
          { assignedToId: userId, assignedToRole: 'support' },
        ],
      };
    } else {
      return errorResponse(res, 'Access denied', 403);
    }

    const tickets = await models.SupportTicket.findAll({
      where: whereClause,
      order: [['lastMessageAt', 'DESC'], ['createdAt', 'DESC']],
    });

    // Enrich with user info and last message
    const enrichedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const plain = ticket.toJSON();

        // Get user info
        let user = null;
        if (ticket.userRole === 'care_giver') {
          user = await models.CareGiver.findByPk(ticket.userId, {
            attributes: ['id', 'firstName', 'lastName', 'profileImageUrl', 'email'],
          });
        } else {
          user = await models.CareRecipient.findByPk(ticket.userId, {
            attributes: ['id', 'firstName', 'lastName', 'profileImageUrl', 'email'],
          });
        }

        // Get last message
        const lastMessage = await models.SupportMessage.findOne({
          where: { ticketId: ticket.id },
          order: [['createdAt', 'DESC']],
        });

        // Get unread count (messages from user not read by agent)
        const unreadCount = await models.SupportMessage.count({
          where: {
            ticketId: ticket.id,
            senderRole: { [Op.in]: ['care_giver', 'care_recipient'] },
            isRead: false,
          },
        });

        // Get assigned staff name
        let assignedStaff = null;
        if (ticket.assignedToId) {
          try {
            if (ticket.assignedToRole === 'admin') {
              const admin = await models.Admin.findByPk(ticket.assignedToId, { attributes: ['id', 'firstName', 'lastName'] });
              assignedStaff = admin ? admin.toJSON() : null;
            } else if (ticket.assignedToRole === 'support') {
              const support = await models.Support.findByPk(ticket.assignedToId, { attributes: ['id', 'firstName', 'lastName'] });
              assignedStaff = support ? support.toJSON() : null;
            }
          } catch (e) { /* ignore */ }
        }

        return {
          ...plain,
          user: user?.toJSON() || null,
          lastMessage: lastMessage?.toJSON() || null,
          unreadCount,
          assignedStaff,
        };
      })
    );

    return successResponse(res, { tickets: enrichedTickets });
  } catch (error) {
    console.error('getTickets error:', error);
    return errorResponse(res, 'Failed to get tickets', 500);
  }
};

/**
 * Close a ticket
 * PUT /api/support/tickets/:ticketId/close
 */
const closeTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const role = req.userRole;

    if (role !== 'admin' && role !== 'support') {
      return errorResponse(res, 'Access denied', 403);
    }

    const ticket = await models.SupportTicket.findByPk(ticketId);
    if (!ticket) return errorResponse(res, 'Ticket not found', 404);

    await ticket.update({ status: 'closed' });

    // Send ticket closed email to the user (non-blocking)
    try {
      const UserModel = ticket.userRole === 'care_giver' ? models.CareGiver : models.CareRecipient;
      const ticketUser = await UserModel.findByPk(ticket.userId, {
        attributes: ['firstName', 'email'],
      });
      if (ticketUser) {
        sendTicketClosedEmail(ticketUser.email, ticketUser.firstName, ticket.id).catch((err) => {
          console.error('Failed to send ticket closed email:', err);
        });
      }
    } catch (emailErr) {
      console.error('Error preparing ticket closed email:', emailErr);
    }

    // Notify via socket
    try {
      const { getIO } = require('../socket');
      const io = getIO();

      const ticketData = ticket.toJSON();

      // Notify the ticket owner (care_giver or care_recipient)
      const userKey = `${ticket.userRole}:${ticket.userId}`;
      io.to(userKey).emit('support_ticket_closed', {
        ticketId: parseInt(ticketId),
        ticket: ticketData,
      });

      // Notify everyone in the ticket room
      io.to(`support_ticket:${ticketId}`).emit('support_ticket_closed', {
        ticketId: parseInt(ticketId),
        ticket: ticketData,
      });

      // Notify support agents and admins
      io.to('support_agents').to('admin_agents').emit('support_ticket_closed', {
        ticketId: parseInt(ticketId),
        ticket: ticketData,
      });
    } catch (socketErr) {
      console.error('Socket emit error:', socketErr);
    }

    return successResponse(res, { ticket: ticket.toJSON() }, 'Ticket closed');
  } catch (error) {
    console.error('closeTicket error:', error);
    return errorResponse(res, 'Failed to close ticket', 500);
  }
};

module.exports = { getTickets, closeTicket };
