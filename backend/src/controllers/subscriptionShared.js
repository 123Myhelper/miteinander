const Stripe = require('stripe');
const config = require('../config/config');
const models = require('../models');
const { successResponse, errorResponse, USER_ROLES } = require('../utils/helpers');

const stripe = new Stripe(config.stripe.secretKey);

/**
 * Get or create a Stripe customer for the user
 */
const getOrCreateCustomer = async (user, role) => {
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    metadata: {
      userId: String(user.id),
      role,
    },
  });

  await user.update({ stripeCustomerId: customer.id });
  return customer.id;
};

module.exports = { stripe, getOrCreateCustomer, config, models, successResponse, errorResponse, USER_ROLES };
