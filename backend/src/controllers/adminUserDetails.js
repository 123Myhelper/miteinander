const { models, successResponse, errorResponse, getPagination, getPagingData, Op, config, Admin, Support, CareGiver, CareRecipient, CareNeed, Review, SettlementRequest, sequelize, getStripe } = require('./adminShared');

/**
 * Get subscription details for a user (care giver or care recipient)
 * GET /api/admin/subscription/:userType/:userId
 * GET /api/support/subscription/:userType/:userId
 */
const getUserSubscriptionDetails = async (req, res) => {
  try {
    const { userType, userId } = req.params;

    if (!['care-giver', 'care-recipient'].includes(userType)) {
      return errorResponse(res, 'Invalid user type', 400, 'INVALID_USER_TYPE');
    }

    const Model = userType === 'care-giver' ? CareGiver : CareRecipient;
    const user = await Model.findByPk(userId, {
      attributes: ['id', 'subscriptionStatus', 'subscriptionId', 'trialEndsAt', 'subscriptionEndsAt', 'stripeCustomerId'],
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404, 'NOT_FOUND');
    }

    const raw = user.get({ plain: true });
    let effectiveStatus = raw.subscriptionStatus || 'none';

    const isCancelingFromDb = effectiveStatus === 'active' && raw.subscriptionEndsAt != null;

    let currentPeriodEnd = null;
    let plan = null;
    let isCanceling = isCancelingFromDb;
    const stripe = getStripe();

    if (stripe && raw.subscriptionId && ['active', 'past_due'].includes(effectiveStatus)) {
      try {
        const sub = await stripe.subscriptions.retrieve(raw.subscriptionId);
        const item = sub.items?.data?.[0];
        const periodEnd = sub.current_period_end || item?.current_period_end;
        if (periodEnd) {
          currentPeriodEnd = new Date(periodEnd * 1000).toISOString();
        }
        const priceId = item?.price?.id || item?.plan?.id;
        if (priceId === config.stripe.monthlyPriceId) plan = 'monthly';
        else if (priceId === config.stripe.yearlyPriceId) plan = 'yearly';
        // Use Stripe's authoritative cancel_at_period_end flag
        if (sub.cancel_at_period_end) {
          isCanceling = true;
        }
      } catch (stripeErr) {
        console.error('Stripe fetch error for admin subscription details:', stripeErr.message);
      }
    }

    return successResponse(res, {
      subscriptionStatus: effectiveStatus,
      subscriptionEndsAt: raw.subscriptionEndsAt || null,
      currentPeriodEnd,
      plan,
      isCanceling,
    }, 'Subscription details retrieved');
  } catch (error) {
    console.error('getUserSubscriptionDetails error:', error);
    return errorResponse(res, 'Failed to retrieve subscription details', 500, 'FETCH_ERROR');
  }
};

/**
 * Get reviews for a specific caregiver (admin/support)
 * GET /api/admin/care-givers/:id/reviews
 */
const getCaregiverReviews = async (req, res) => {
  try {
    const caregiverId = parseInt(req.params.id);
    if (isNaN(caregiverId)) {
      return errorResponse(res, 'Invalid caregiver ID', 400);
    }

    const reviews = await Review.findAll({
      where: { careGiverId: caregiverId },
      include: [
        {
          model: CareRecipient,
          as: 'careRecipient',
          attributes: ['id', 'firstName', 'lastName', 'profileImageUrl'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, { reviews });
  } catch (error) {
    console.error('getCaregiverReviews error:', error);
    return errorResponse(res, 'Failed to fetch reviews', 500);
  }
};

module.exports = { getUserSubscriptionDetails, getCaregiverReviews };
