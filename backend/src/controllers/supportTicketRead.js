const { Op, models, successResponse, errorResponse, sendTicketClosedEmail, sendTicketAssignedEmail } = require('./supportShared');

/**
 * Get or create user's active support ticket.
 * A user can only have one open/assigned ticket at a time.
 * 
 * POST /api/support/ticket
 */
const getOrCreateTicket = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.userRole;

    if (role !== 'care_giver' && role !== 'care_recipient') {
      return errorResponse(res, 'Only care givers and care recipients can create support tickets', 403);
    }

    // Find existing open/assigned ticket
    let ticket = await models.SupportTicket.findOne({
      where: {
        userId,
        userRole: role,
        status: { [Op.in]: ['open', 'assigned'] },
      },
    });

    if (!ticket) {
      ticket = await models.SupportTicket.create({
        userId,
        userRole: role,
        status: 'open',
      });

      // Notify support agents and admins about the new ticket
      try {
        const { getIO } = require('../socket');
        const io = getIO();

        // Get user info for the notification
        let userInfo = null;
        const UserModel = role === 'care_giver' ? models.CareGiver : models.CareRecipient;
        userInfo = await UserModel.findByPk(userId, {
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImageUrl'],
        });

        io.to('support_agents').to('admin_agents').emit('support_ticket_new', {
          ticket: {
            ...ticket.toJSON(),
            user: userInfo?.toJSON() || null,
            lastMessage: null,
            unreadCount: 0,
          },
        });
      } catch (socketErr) {
        console.error('Socket emit error (new ticket):', socketErr);
      }
    }

    return successResponse(res, { ticket });
  } catch (error) {
    console.error('getOrCreateTicket error:', error);
    return errorResponse(res, 'Failed to get/create ticket', 500);
  }
};

/**
 * Get messages for a ticket
 * 
 * GET /api/support/tickets/:ticketId/messages
 */
const getTicketMessages = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;
    const role = req.userRole;

    const ticket = await models.SupportTicket.findByPk(ticketId);
    if (!ticket) return errorResponse(res, 'Ticket not found', 404);

    // Verify access
    const isUser = (role === ticket.userRole && userId === ticket.userId);
    const isAdmin = role === 'admin';
    const isAssignedSupport = role === 'support' && ticket.assignedToId === userId;
    const isUnassignedOpen = role === 'support' && ticket.status === 'open';

    if (!isUser && !isAdmin && !isAssignedSupport && !isUnassignedOpen) {
      return errorResponse(res, 'Access denied', 403);
    }

    const messages = await models.SupportMessage.findAll({
      where: { ticketId },
      order: [['createdAt', 'ASC']],
    });

    // Enrich messages with sender names
    const enrichedMessages = await Promise.all(
      messages.map(async (msg) => {
        const plain = msg.toJSON();
        let senderName = null;
        try {
          if (msg.senderRole === 'admin') {
            const admin = await models.Admin.findByPk(msg.senderId, { attributes: ['firstName', 'lastName'] });
            senderName = admin ? `${admin.firstName} ${admin.lastName}` : null;
          } else if (msg.senderRole === 'support') {
            const support = await models.Support.findByPk(msg.senderId, { attributes: ['firstName', 'lastName'] });
            senderName = support ? `${support.firstName} ${support.lastName}` : null;
          } else if (msg.senderRole === 'care_giver') {
            const cg = await models.CareGiver.findByPk(msg.senderId, { attributes: ['firstName', 'lastName'] });
            senderName = cg ? `${cg.firstName} ${cg.lastName}` : null;
          } else if (msg.senderRole === 'care_recipient') {
            const cr = await models.CareRecipient.findByPk(msg.senderId, { attributes: ['firstName', 'lastName'] });
            senderName = cr ? `${cr.firstName} ${cr.lastName}` : null;
          }
        } catch (e) { /* ignore */ }
        return { ...plain, senderName };
      })
    );

    return successResponse(res, { messages: enrichedMessages, ticket });
  } catch (error) {
    console.error('getTicketMessages error:', error);
    return errorResponse(res, 'Failed to get messages', 500);
  }
};

module.exports = { getOrCreateTicket, getTicketMessages };
