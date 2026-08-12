module.exports = ({ io, socket, onlineUsers, getUserKey, models }) => {
    /**
     * Respond to a settlement request
     * Client emits: socket.emit('respond_settlement', { conversationId, messageId, accepted })
     */
    socket.on('respond_settlement', async ({ conversationId, messageId, accepted }, callback) => {
      try {
        if (socket.userRole !== 'care_recipient') {
          return callback?.({ error: 'Only care recipients can respond to settlement requests' });
        }

        const conversation = await models.Conversation.findByPk(conversationId);
        if (!conversation || conversation.careRecipientId !== socket.userId) {
          return callback?.({ error: 'Access denied' });
        }

        // Find the original settlement request message
        const requestMsg = await models.Message.findByPk(messageId);
        if (!requestMsg || requestMsg.messageType !== 'settlement_request') {
          return callback?.({ error: 'Invalid settlement request' });
        }

        const responseType = accepted ? 'settlement_confirmed' : 'settlement_dismissed';
        const responseContent = accepted
          ? 'Settlement confirmed'
          : 'Settlement declined';

        // Create response message
        const message = await models.Message.create({
          conversationId: parseInt(conversationId),
          senderRole: 'care_recipient',
          senderId: socket.userId,
          content: responseContent,
          messageType: responseType,
        });

        await conversation.update({ lastMessageAt: new Date() });

        if (accepted) {
          // Mark care recipient as settled
          const recipient = await models.CareRecipient.findByPk(socket.userId);
          if (recipient && !recipient.isSettled) {
            await recipient.update({
              isSettled: true,
              settledWithCaregiverId: conversation.careGiverId,
              settledAt: new Date(),
            });
          }
        }

        const messageData = message.toJSON();

        // Broadcast to conversation room
        io.to(`conversation:${conversationId}`).emit('new_message', messageData);

        // Notify caregiver
        const caregiverKey = getUserKey('care_giver', conversation.careGiverId);
        io.to(caregiverKey).emit('new_message_notification', {
          conversationId: parseInt(conversationId),
          message: messageData,
        });

        if (accepted) {
          // Notify both parties of settlement
          io.to(`conversation:${conversationId}`).emit('settlement_completed', {
            conversationId: parseInt(conversationId),
            careRecipientId: socket.userId,
            careGiverId: conversation.careGiverId,
          });
        }

        callback?.({ success: true, message: messageData });
      } catch (error) {
        console.error('respond_settlement error:', error);
        callback?.({ error: 'Failed to respond to settlement' });
      }
    });

    /**
     * Mark messages as read
     */
    socket.on('mark_read', async ({ conversationId }) => {
      try {
        const oppositeRole = socket.userRole === 'care_giver' ? 'care_recipient' : 'care_giver';
        await models.Message.update(
          { isRead: true },
          {
            where: {
              conversationId,
              senderRole: oppositeRole,
              isRead: false,
            },
          }
        );

        const conversation = await models.Conversation.findByPk(conversationId);
        if (conversation) {
          const otherUserKey = oppositeRole === 'care_giver'
            ? getUserKey('care_giver', conversation.careGiverId)
            : getUserKey('care_recipient', conversation.careRecipientId);

          io.to(otherUserKey).emit('messages_read', {
            conversationId: parseInt(conversationId),
          });
        }
      } catch (error) {
        console.error('mark_read error:', error);
      }
    });
};
