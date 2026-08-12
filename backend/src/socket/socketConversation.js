module.exports = ({ io, socket, onlineUsers, getUserKey, models }) => {
    /**
     * Join a conversation room
     * Client emits: socket.emit('join_conversation', { conversationId })
     */
    socket.on('join_conversation', async ({ conversationId }) => {
      try {
        const conversation = await models.Conversation.findByPk(conversationId);
        if (!conversation) return;

        // Verify participation
        const isParticipant =
          (socket.userRole === 'care_giver' && conversation.careGiverId === socket.userId) ||
          (socket.userRole === 'care_recipient' && conversation.careRecipientId === socket.userId);

        if (!isParticipant) return;

        socket.join(`conversation:${conversationId}`);
        console.log(`  📨 ${socket.userKey} joined conversation:${conversationId}`);

        // Mark messages from the other party as read
        const oppositeRole = socket.userRole === 'care_giver' ? 'care_recipient' : 'care_giver';
        const updatedCount = await models.Message.update(
          { isRead: true },
          {
            where: {
              conversationId,
              senderRole: oppositeRole,
              isRead: false,
            },
          }
        );

        if (updatedCount[0] > 0) {
          // Notify the other party that their messages were read
          const otherUserKey = oppositeRole === 'care_giver'
            ? getUserKey('care_giver', conversation.careGiverId)
            : getUserKey('care_recipient', conversation.careRecipientId);

          io.to(otherUserKey).emit('messages_read', {
            conversationId: parseInt(conversationId),
          });
        }
      } catch (error) {
        console.error('join_conversation error:', error);
      }
    });

    /**
     * Leave a conversation room
     */
    socket.on('leave_conversation', ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
    });

    /**
     * Send a message via socket
     * Client emits: socket.emit('send_message', { conversationId, content, messageType })
     */
    socket.on('send_message', async ({ conversationId, content, messageType = 'text' }, callback) => {
      try {
        if (!content || !content.trim()) {
          return callback?.({ error: 'Message content is required' });
        }

        const conversation = await models.Conversation.findByPk(conversationId);
        if (!conversation) {
          return callback?.({ error: 'Conversation not found' });
        }

        // Verify participation
        const isParticipant =
          (socket.userRole === 'care_giver' && conversation.careGiverId === socket.userId) ||
          (socket.userRole === 'care_recipient' && conversation.careRecipientId === socket.userId);

        if (!isParticipant) {
          return callback?.({ error: 'Access denied' });
        }

        // Only caregivers can send settlement requests
        if (messageType === 'settlement_request' && socket.userRole !== 'care_giver') {
          return callback?.({ error: 'Only caregivers can send settlement requests' });
        }

        // Prevent settlement request if recipient is already settled
        if (messageType === 'settlement_request') {
          const recipient = await models.CareRecipient.findByPk(conversation.careRecipientId);
          if (recipient && recipient.isSettled) {
            return callback?.({ error: 'Care recipient is already settled' });
          }
        }

        // Block messages from caregivers to settled recipients (unless settled with them)
        if (socket.userRole === 'care_giver') {
          const recipient = await models.CareRecipient.findByPk(conversation.careRecipientId);
          if (recipient && recipient.isSettled && recipient.settledWithCaregiverId !== socket.userId) {
            return callback?.({ error: 'This care recipient is settled with another caregiver' });
          }
        }

        // Create message
        const message = await models.Message.create({
          conversationId: parseInt(conversationId),
          senderRole: socket.userRole,
          senderId: socket.userId,
          content: content.trim(),
          messageType,
        });

        // Update conversation timestamp
        await conversation.update({ lastMessageAt: new Date() });

        const messageData = message.toJSON();

        // Broadcast to everyone in the conversation room (including sender)
        io.to(`conversation:${conversationId}`).emit('new_message', messageData);

        // Also notify the other party's personal room (for badge/notification if not in conversation)
        const otherUserKey = socket.userRole === 'care_giver'
          ? getUserKey('care_recipient', conversation.careRecipientId)
          : getUserKey('care_giver', conversation.careGiverId);

        // Send notification to other user's personal room
        io.to(otherUserKey).emit('new_message_notification', {
          conversationId: parseInt(conversationId),
          message: messageData,
          senderName: `${socket.userId}`, // Frontend will resolve the name
        });

        callback?.({ success: true, message: messageData });
      } catch (error) {
        console.error('send_message error:', error);
        callback?.({ error: 'Failed to send message' });
      }
    });

    /**
     * Typing indicators
     */
    socket.on('typing_start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userKey: socket.userKey,
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
        conversationId,
        userKey: socket.userKey,
      });
    });
};
