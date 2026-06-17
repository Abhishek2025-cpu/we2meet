const mongoose = require("mongoose");

const subscriptionPlanSchema =
  new mongoose.Schema(
    {
      planName: {
        type: String,
        required: true
      },

      description: {
        type: String,
        required: true
      },

      price: {
        type: Number,
        required: true
      },

      validityDays: {
        type: Number,
        required: true
      },

      benefits: [String],

      badge: {
        type: String,
        default: ""
      },

      isPopular: {
        type: Boolean,
        default: false
      },

      isActive: {
        type: Boolean,
        default: true
      }
    },
    {
      timestamps: true
    }
  );

module.exports = mongoose.model(
  "SubscriptionPlan",
  subscriptionPlanSchema
);