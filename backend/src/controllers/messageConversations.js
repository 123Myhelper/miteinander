const { Op, models, successResponse, errorResponse } = require('./messageShared');

/**
 * Get or create a conversation between current user and the other party.
 * Works for both care_giver and care_recipient roles.
 * 
 * POST /api/messages/conversations
 * Body: { otherUserId: number }
 */
const getOrCreateConversation = async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const userId = req.user.id;
    const role = req.userRole;

    if (!otherUserId) {
      return errorResponse(res, 'otherUserId is required', 400);
    }

    let careGiverId, careRecipientId;

    if (role === 'care_giver') {
      careGiverId = userId;
      careRecipientId = otherUserId;
      // Verify the recipient exists
      const recipient = await models.CareRecipient.findByPk(otherUserId);
      if (!recipient) return errorResponse(res, 'User not found', 404);
    } else if (role === 'care_recipient') {
      careRecipientId = userId;
      careGiverId = otherUserId;
      // Verify the caregiver exists
      const caregiver = await models.CareGiver.findByPk(otherUserId);
      if (!caregiver) return errorResponse(res, 'User not found', 404);
    } else {
      return errorResponse(res, 'Invalid role for messaging', 403);
    }

    // Find or create
    let [conversation, created] = await models.Conversation.findOrCreate({
      where: { careGiverId, careRecipientId },
      defaults: { careGiverId, careRecipientId },
    });

    // Reload with associations
    conversation = await models.Conversation.findByPk(conversation.id, {
      include: [
        {
          model: models.CareGiver,
          as: 'careGiver',
          attributes: ['id', 'firstName', 'lastName', 'profileImageUrl', 'occupation'],
        },
        {
          model: models.CareRecipient,
          as: 'careRecipient',
          attributes: ['id', 'firstName', 'lastName', 'profileImageUrl'],
        },
      ],
    });

    return successResponse(res, { conversation, created }, created ? 'Conversation created' : 'Conversation found');
  } catch (error) {
    console.error('getOrCreateConversation error:', error);
    return errorResponse(res, 'Failed to get/create conversation', 500);
  }
};

/**
 * Get all conversations for the current user.
 * Includes last message and unread count.
 * 
 * GET /api/messages/conversations
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.userRole;

    const whereClause = role === 'care_giver'
      ? { careGiverId: userId }
      : { careRecipientId: userId };

    const conversations = await models.Conversation.findAll({
      where: whereClause,
      include: [
        {
          model: models.CareGiver,
          as: 'careGiver',
          attributes: ['id', 'firstName', 'lastName', 'profileImageUrl', 'occupation'],
        },
        {
          model: models.CareRecipient,
          as: 'careRecipient',
          attributes: ['id', 'firstName', 'lastName', 'profileImageUrl', 'isSettled', 'settledWithCaregiverId'],
          include: [
            {
              model: models.CareGiver,
              as: 'settledWithCaregiver',
              attributes: ['id', 'firstName', 'lastName', 'profileImageUrl'],
              required: false,
            },
          ],
        },
        {
          model: models.Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'content', 'senderRole', 'senderId', 'isRead', 'createdAt', 'messageType'],
        },
      ],
      order: [['lastMessageAt', 'DESC'], ['createdAt', 'DESC']],
    });

    // Calculate unread counts for each conversation
    const oppositeRole = role === 'care_giver' ? 'care_recipient' : 'care_giver';
    const conversationsData = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await models.Message.count({
          where: {
            conversationId: conv.id,
            senderRole: oppositeRole,
            isRead: false,
          },
        });

        const plainConv = conv.toJSON();
        return {
          ...plainConv,
          lastMessage: plainConv.messages?.[0] || null,
          unreadCount,
          messages: undefined, // Remove the full messages array
        };
      })
    );

    return successResponse(res, { conversations: conversationsData });
  } catch (error) {
    console.error('getConversations error:', error);
    return errorResponse(res, 'Failed to get conversations', 500);
  }
};

module.exports = { getOrCreateConversation, getConversations };
