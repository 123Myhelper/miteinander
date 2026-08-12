const { stripe, getOrCreateCustomer, config, successResponse, errorResponse, USER_ROLES } = require('./subscriptionShared');

/**
 * Create a Stripe Checkout Session for subscription
 * POST /api/subscription/create-checkout
 * Body: { plan: 'monthly' | 'yearly' }
 */
const createCheckoutSession = async (req, res, next) => {
  try {
    const { plan } = req.body;
    const user = req.user;
    const role = req.userRole;

    if (!plan || !['yearly'].includes(plan)) {
      return errorResponse(res, 'Invalid plan. Must be "yearly".', 400, 'INVALID_PLAN');
    }

    const priceId = config.stripe.yearlyPriceId;

    const customerId = await getOrCreateCustomer(user, role);

    // Determine the success / cancel URLs
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const dashboardPath = role === USER_ROLES.CARE_GIVER ? '/caregiver' : '/dashboard';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card', 'paypal'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontendUrl}/plans/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/plans`,
      metadata: {
        userId: String(user.id),
        role,
        plan,
      },
    });

    return successResponse(res, { url: session.url, sessionId: session.id }, 'Checkout session created');
  } catch (error) {
    next(error);
  }
};

/**
 * Create a Stripe Customer Portal session (manage subscription)
 * POST /api/subscription/portal
 */
const createPortalSession = async (req, res, next) => {
  try {
    const user = req.user;
    const role = req.userRole;

    if (!user.stripeCustomerId) {
      return errorResponse(res, 'No subscription found', 400, 'NO_SUBSCRIPTION');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const dashboardPath = role === USER_ROLES.CARE_GIVER ? '/caregiver/settings' : '/dashboard/settings';

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${frontendUrl}${dashboardPath}`,
    });

    return successResponse(res, { url: session.url }, 'Portal session created');
  } catch (error) {
    next(error);
  }
};

/**
 * Verify a checkout session completed (called from frontend success page)
 * POST /api/subscription/verify
 * Body: { sessionId: string }
 */
const verifyCheckout = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const user = req.user;

    if (!sessionId) {
      return errorResponse(res, 'Session ID is required', 400, 'MISSING_SESSION_ID');
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.payment_status !== 'paid') {
      return errorResponse(res, 'Payment not completed', 400, 'PAYMENT_INCOMPLETE');
    }

    // Update user subscription
    const subscription = session.subscription;
    await user.update({
      subscriptionStatus: 'active',
      subscriptionId: typeof subscription === 'string' ? subscription : subscription.id,
      stripeCustomerId: session.customer,
      subscriptionEndsAt: null,
    });

    return successResponse(res, {
      subscriptionStatus: 'active',
    }, 'Subscription activated');
  } catch (error) {
    next(error);
  }
};

module.exports = { createCheckoutSession, createPortalSession, verifyCheckout };
