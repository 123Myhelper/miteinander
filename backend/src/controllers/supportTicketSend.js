const { Op, models, successResponse, errorResponse, sendTicketClosedEmail, sendTicketAssignedEmail } = require('./supportShared');

/**
 * Send a support message
 * 
 * POST /api/support/tickets/:ticketId/messages
 */
const sendTicketMessage = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const role = req.userRole;

    if (!content || !content.trim()) {
      return errorResponse(res, 'Content is required', 400);
    }

    const ticket = await models.SupportTicket.findByPk(ticketId);
    if (!ticket) return errorResponse(res, 'Ticket not found', 404);

    // Verify access
    const isUser = (role === ticket.userRole && userId === ticket.userId);
    const isAdmin = role === 'admin';
    const isSupport = role === 'support';

    if (!isUser && !isAdmin && !isSupport) {
      return errorResponse(res, 'Access denied', 403);
    }

    // If support/admin replying and ticket is open → assign it
    if ((isSupport || isAdmin) && ticket.status === 'open') {
      await ticket.update({
        status: 'assigned',
        assignedToRole: role,
        assignedToId: userId,
      });
    }

    // If support agent, must be the assigned one (unless admin)
    if (isSupport && ticket.status === 'assigned' && ticket.assignedToId !== userId) {
      return errorResponse(res, 'This ticket is assigned to another agent', 403);
    }

    const message = await models.SupportMessage.create({
      ticketId: parseInt(ticketId),
      senderRole: role,
      senderId: userId,
      content: content.trim(),
    });

    await ticket.update({ lastMessageAt: new Date() });

    // Emit socket events
    try {
      const { getIO } = require('../socket');
      const io = getIO();

      const messageData = message.toJSON();

      // Resolve sender name
      let senderName = null;
      try {
        if (role === 'admin') {
          const admin = await models.Admin.findByPk(userId, { attributes: ['firstName', 'lastName'] });
          senderName = admin ? `${admin.firstName} ${admin.lastName}` : null;
        } else if (role === 'support') {
          const support = await models.Support.findByPk(userId, { attributes: ['firstName', 'lastName'] });
          senderName = support ? `${support.firstName} ${support.lastName}` : null;
        } else if (role === 'care_giver') {
          const cg = await models.CareGiver.findByPk(userId, { attributes: ['firstName', 'lastName'] });
          senderName = cg ? `${cg.firstName} ${cg.lastName}` : null;
        } else if (role === 'care_recipient') {
          const cr = await models.CareRecipient.findByPk(userId, { attributes: ['firstName', 'lastName'] });
          senderName = cr ? `${cr.firstName} ${cr.lastName}` : null;
        }
      } catch (e) { /* ignore */ }
      messageData.senderName = senderName;

      // Send to ticket room (user viewing their chat)
      io.to(`support_ticket:${ticketId}`).emit('support_message', messageData);

      if (isUser) {
        // User sent a message → notify support/admin rooms
        if (ticket.status === 'open') {
          // Broadcast to all support agents + admins
          io.to('support_agents').to('admin_agents').emit('support_ticket_update', {
            ticketId: parseInt(ticketId),
            message: messageData,
            ticket: ticket.toJSON(),
          });
        } else if (ticket.assignedToId) {
          // Only notify assigned agent + admins
          io.to(`${ticket.assignedToRole}:${ticket.assignedToId}`).emit('support_ticket_update', {
            ticketId: parseInt(ticketId),
            message: messageData,
            ticket: ticket.toJSON(),
          });
          io.to('admin_agents').emit('support_ticket_update', {
            ticketId: parseInt(ticketId),
            message: messageData,
            ticket: ticket.toJSON(),
          });
        }
      } else {
        // Agent/admin replied → notify the user
        const userKey = `${ticket.userRole}:${ticket.userId}`;
        io.to(userKey).emit('support_message_notification', {
          ticketId: parseInt(ticketId),
          message: messageData,
        });

        // Update ticket list for all agents/admins
        io.to('support_agents').to('admin_agents').emit('support_ticket_update', {
          ticketId: parseInt(ticketId),
          message: messageData,
          ticket: ticket.toJSON(),
        });

        // If this was the first reply (assigned now) → hide from other support agents
        if (ticket.status === 'assigned') {
          io.to('support_agents').to('admin_agents').emit('support_ticket_claimed', {
            ticketId: parseInt(ticketId),
            assignedToId: ticket.assignedToId,
            assignedToRole: ticket.assignedToRole,
          });
        }
      }
    } catch (socketError) {
      console.error('Socket emit error:', socketError);
    }

    return successResponse(res, { message: message.toJSON(), ticket: ticket.toJSON() }, 'Message sent', 201);
  } catch (error) {
    console.error('sendTicketMessage error:', error);
    return errorResponse(res, 'Failed to send message', 500);
  }
};

module.exports = { sendTicketMessage };
