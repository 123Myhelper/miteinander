const { Op, models, successResponse, errorResponse } = require('./messageShared');

/**
 * Get messages for a conversation with pagination.
 * Marks messages from the other party as read.
 * 
 * GET /api/messages/conversations/:conversationId/messages?page=1&limit=50
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const role = req.userRole;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Verify user belongs to this conversation
    const conversation = await models.Conversation.findByPk(conversationId);
    if (!conversation) {
      return errorResponse(res, 'Conversation not found', 404);
    }

    const isParticipant = (role === 'care_giver' && conversation.careGiverId === userId) ||
      (role === 'care_recipient' && conversation.careRecipientId === userId);

    if (!isParticipant) {
      return errorResponse(res, 'Access denied', 403);
    }

    // Get messages (newest first for pagination, client reverses)
    const { count, rows: messages } = await models.Message.findAndCountAll({
      where: { conversationId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    // Mark other party's messages as read
    const oppositeRole = role === 'care_giver' ? 'care_recipient' : 'care_giver';
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

    return successResponse(res, {
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
        hasMore: offset + messages.length < count,
      },
    });
  } catch (error) {
    console.error('getMessages error:', error);
    return errorResponse(res, 'Failed to get messages', 500);
  }
};

/**
 * Send a message (REST fallback — main path is through Socket.IO).
 * 
 * POST /api/messages/conversations/:conversationId/messages
 * Body: { content: string }
 */
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const role = req.userRole;

    if (!content || !content.trim()) {
      return errorResponse(res, 'Message content is required', 400);
    }

    // Verify user belongs to this conversation
    const conversation = await models.Conversation.findByPk(conversationId);
    if (!conversation) {
      return errorResponse(res, 'Conversation not found', 404);
    }

    const isParticipant = (role === 'care_giver' && conversation.careGiverId === userId) ||
      (role === 'care_recipient' && conversation.careRecipientId === userId);

    if (!isParticipant) {
      return errorResponse(res, 'Access denied', 403);
    }

    const message = await models.Message.create({
      conversationId: parseInt(conversationId),
      senderRole: role,
      senderId: userId,
      content: content.trim(),
    });

    // Update conversation's last message timestamp
    await conversation.update({ lastMessageAt: new Date() });

    return successResponse(res, { message }, 'Message sent', 201);
  } catch (error) {
    console.error('sendMessage error:', error);
    return errorResponse(res, 'Failed to send message', 500);
  }
};

module.exports = { getMessages, sendMessage };
