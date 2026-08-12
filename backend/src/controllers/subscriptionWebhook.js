const { stripe, config, models } = require('./subscriptionShared');

/**
 * Stripe Webhook Handler
 * POST /api/subscription/webhook
 * Must use raw body (not parsed JSON)
 */
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (config.stripe.webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
    } else {
      // In development without webhook secret, parse the body directly
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const { CareGiver, CareRecipient } = models;

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const status = subscription.status; // active, past_due, canceled, etc.

        // Find the user by stripe customer id
        let user = await CareGiver.findOne({ where: { stripeCustomerId: customerId } });
        if (!user) {
          user = await CareRecipient.findOne({ where: { stripeCustomerId: customerId } });
        }

        if (user) {
          const mappedStatus = ['active', 'trialing'].includes(status) ? 'active' : 
                               status === 'past_due' ? 'past_due' : 
                               status === 'canceled' ? 'canceled' : user.subscriptionStatus;

          const updateData = {
            subscriptionStatus: mappedStatus,
            subscriptionId: subscription.id,
          };

          // Handle "cancel at period end" — user canceled but subscription stays
          // active until the current billing period ends
          if (subscription.cancel_at_period_end && ['active', 'trialing'].includes(status)) {
            // User pressed cancel — store when the subscription will actually end
            updateData.subscriptionEndsAt = new Date(subscription.current_period_end * 1000);
            console.log(`📅 Subscription will end on ${updateData.subscriptionEndsAt.toISOString()} for customer ${customerId}`);
          } else if (!subscription.cancel_at_period_end && ['active', 'trialing'].includes(status)) {
            // User re-subscribed or cancellation was reversed — clear the end date
            updateData.subscriptionEndsAt = null;
          }

          await user.update(updateData);
          console.log(`✅ Subscription ${event.type} for customer ${customerId}: ${mappedStatus} (cancel_at_period_end: ${subscription.cancel_at_period_end})`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        let user = await CareGiver.findOne({ where: { stripeCustomerId: customerId } });
        if (!user) {
          user = await CareRecipient.findOne({ where: { stripeCustomerId: customerId } });
        }

        if (user) {
          // The billing period has actually ended — now lock out the user
          await user.update({
            subscriptionStatus: 'canceled',
            subscriptionId: null,
            subscriptionEndsAt: null,
          });
          console.log(`❌ Subscription ended for customer ${customerId}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        let user = await CareGiver.findOne({ where: { stripeCustomerId: customerId } });
        if (!user) {
          user = await CareRecipient.findOne({ where: { stripeCustomerId: customerId } });
        }

        if (user && user.subscriptionStatus !== 'active') {
          await user.update({ subscriptionStatus: 'active' });
          console.log(`💳 Payment succeeded, subscription active for ${customerId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        let user = await CareGiver.findOne({ where: { stripeCustomerId: customerId } });
        if (!user) {
          user = await CareRecipient.findOne({ where: { stripeCustomerId: customerId } });
        }

        if (user) {
          await user.update({ subscriptionStatus: 'past_due' });
          console.log(`⚠️ Payment failed for ${customerId}`);
        }
        break;
      }

      default:
        // Unhandled event type
        break;
    }
  } catch (err) {
    console.error(`❌ Webhook handler error for ${event.type}:`, err);
  }

  res.json({ received: true });
};

module.exports = { handleWebhook };
