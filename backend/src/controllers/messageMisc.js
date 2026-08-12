const { Op, models, successResponse, errorResponse } = require('./messageShared');

/**
 * Get total unread message count for the current user.
 * Used for sidebar badge.
 * 
 * GET /api/messages/unread-count
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.userRole;

    // Find all conversation IDs for this user
    const whereClause = role === 'care_giver'
      ? { careGiverId: userId }
      : { careRecipientId: userId };

    const conversations = await models.Conversation.findAll({
      where: whereClause,
      attributes: ['id'],
    });

    const conversationIds = conversations.map(c => c.id);

    if (conversationIds.length === 0) {
      return successResponse(res, { unreadCount: 0 });
    }

    const oppositeRole = role === 'care_giver' ? 'care_recipient' : 'care_giver';
    const unreadCount = await models.Message.count({
      where: {
        conversationId: { [Op.in]: conversationIds },
        senderRole: oppositeRole,
        isRead: false,
      },
    });

    return successResponse(res, { unreadCount });
  } catch (error) {
    console.error('getUnreadCount error:', error);
    return errorResponse(res, 'Failed to get unread count', 500);
  }
};

/**
 * Delete a conversation and all its messages.
 * 
 * DELETE /api/messages/conversations/:conversationId
 */
const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const role = req.userRole;

    const conversation = await models.Conversation.findByPk(conversationId);
    if (!conversation) {
      return errorResponse(res, 'Conversation not found', 404);
    }

    const isParticipant = (role === 'care_giver' && conversation.careGiverId === userId) ||
      (role === 'care_recipient' && conversation.careRecipientId === userId);

    if (!isParticipant) {
      return errorResponse(res, 'Access denied', 403);
    }

    // Delete all messages in the conversation
    await models.Message.destroy({
      where: { conversationId: parseInt(conversationId) },
    });

    // Delete the conversation itself
    await conversation.destroy();

    return successResponse(res, null, 'Conversation deleted');
  } catch (error) {
    console.error('deleteConversation error:', error);
    return errorResponse(res, 'Failed to delete conversation', 500);
  }
};

module.exports = { getUnreadCount, deleteConversation };
