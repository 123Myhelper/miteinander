const { stripe, config, successResponse, errorResponse } = require('./subscriptionShared');

/**
 * Get subscription status for the logged-in user
 * GET /api/subscription/status
 */
const getSubscriptionStatus = async (req, res, next) => {
  try {
    const user = req.user;
    const role = req.userRole;

    // Get effective subscription status
    let effectiveStatus = user.subscriptionStatus || 'none';

    // Check if subscription is active but scheduled to cancel
    const isCanceling = effectiveStatus === 'active' && user.subscriptionEndsAt != null;

    // Fetch current_period_end from Stripe for active subscriptions
    let currentPeriodEnd = null;
    let plan = null;
    if (user.subscriptionId && ['active', 'past_due'].includes(effectiveStatus)) {
      try {
        const sub = await stripe.subscriptions.retrieve(user.subscriptionId);
        // In newer Stripe API versions, current_period_end is on the subscription item
        const item = sub.items?.data?.[0];
        const periodEnd = sub.current_period_end || item?.current_period_end;
        if (periodEnd) {
          currentPeriodEnd = new Date(periodEnd * 1000).toISOString();
        }
        // Determine plan from price
        const priceId = item?.price?.id || item?.plan?.id;
        if (priceId === config.stripe.monthlyPriceId) plan = 'monthly';
        else if (priceId === config.stripe.yearlyPriceId) plan = 'yearly';
      } catch {
        // Ignore Stripe errors — return what we have
      }
    }

    return successResponse(res, {
      subscriptionStatus: effectiveStatus,
      subscriptionId: user.subscriptionId || null,
      subscriptionEndsAt: user.subscriptionEndsAt || null,
      currentPeriodEnd,
      plan,
      isCanceling,
      role,
    }, 'Subscription status retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = { getSubscriptionStatus };
