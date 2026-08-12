module.exports = ({ io, socket, onlineUsers, getUserKey, models }) => {
    /**
     * Join a support ticket room
     * Client emits: socket.emit('join_support_ticket', { ticketId })
     */
    socket.on('join_support_ticket', async ({ ticketId }) => {
      try {
        const ticket = await models.SupportTicket.findByPk(ticketId);
        if (!ticket) return;

        // Verify access
        const isUser = (socket.userRole === ticket.userRole && socket.userId === ticket.userId);
        const isAdmin = socket.userRole === 'admin';
        const isAssignedSupport = socket.userRole === 'support' && ticket.assignedToId === socket.userId;
        const isUnassignedOpen = socket.userRole === 'support' && ticket.status === 'open';

        if (!isUser && !isAdmin && !isAssignedSupport && !isUnassignedOpen) return;

        socket.join(`support_ticket:${ticketId}`);
        console.log(`  🎫 ${socket.userKey} joined support_ticket:${ticketId}`);

        // Mark messages from the other side as read
        if (isAdmin || isAssignedSupport || isUnassignedOpen) {
          // Agent viewing: mark user messages as read
          await models.SupportMessage.update(
            { isRead: true },
            {
              where: {
                ticketId,
                senderRole: { [models.Sequelize.Op.in]: ['care_giver', 'care_recipient'] },
                isRead: false,
              },
            }
          );
        } else if (isUser) {
          // User viewing: mark agent messages as read
          await models.SupportMessage.update(
            { isRead: true },
            {
              where: {
                ticketId,
                senderRole: { [models.Sequelize.Op.in]: ['admin', 'support'] },
                isRead: false,
              },
            }
          );
        }
      } catch (error) {
        console.error('join_support_ticket error:', error);
      }
    });

    /**
     * Leave a support ticket room
     */
    socket.on('leave_support_ticket', ({ ticketId }) => {
      socket.leave(`support_ticket:${ticketId}`);
    });

    /**
     * Send a support message via socket
     * Client emits: socket.emit('send_support_message', { ticketId, content }, callback)
     */
    socket.on('send_support_message', async ({ ticketId, content }, callback) => {
      try {
        if (!content || !content.trim()) {
          return callback?.({ error: 'Message content is required' });
        }

        const ticket = await models.SupportTicket.findByPk(ticketId);
        if (!ticket) {
          return callback?.({ error: 'Ticket not found' });
        }

        const isUser = (socket.userRole === ticket.userRole && socket.userId === ticket.userId);
        const isAdmin = socket.userRole === 'admin';
        const isSupport = socket.userRole === 'support';

        if (!isUser && !isAdmin && !isSupport) {
          return callback?.({ error: 'Access denied' });
        }

        // If support/admin replying and ticket is open → assign it
        if ((isSupport || isAdmin) && ticket.status === 'open') {
          await ticket.update({
            status: 'assigned',
            assignedToRole: socket.userRole,
            assignedToId: socket.userId,
          });
        }

        // If support agent, must be the assigned one (unless admin)
        if (isSupport && ticket.status === 'assigned' && ticket.assignedToId !== socket.userId) {
          return callback?.({ error: 'This ticket is assigned to another agent' });
        }

        const message = await models.SupportMessage.create({
          ticketId: parseInt(ticketId),
          senderRole: socket.userRole,
          senderId: socket.userId,
          content: content.trim(),
        });

        await ticket.update({ lastMessageAt: new Date() });

        const messageData = message.toJSON();

        // Broadcast to everyone in the ticket room
        io.to(`support_ticket:${ticketId}`).emit('support_message', messageData);

        if (isUser) {
          // User sent → notify agent rooms
          if (ticket.status === 'open') {
            io.to('support_agents').to('admin_agents').emit('support_ticket_update', {
              ticketId: parseInt(ticketId),
              message: messageData,
              ticket: ticket.toJSON(),
            });
          } else if (ticket.assignedToId) {
            const agentKey = getUserKey(ticket.assignedToRole, ticket.assignedToId);
            io.to(agentKey).emit('support_ticket_update', {
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
          // Agent replied → notify user
          const userKey = getUserKey(ticket.userRole, ticket.userId);
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

          // If ticket was just assigned → notify other agents
          if (ticket.status === 'assigned') {
            io.to('support_agents').emit('support_ticket_claimed', {
              ticketId: parseInt(ticketId),
              assignedToId: ticket.assignedToId,
              assignedToRole: ticket.assignedToRole,
            });
          }
        }

        callback?.({ success: true, message: messageData });
      } catch (error) {
        console.error('send_support_message error:', error);
        callback?.({ error: 'Failed to send message' });
      }
    });
};
