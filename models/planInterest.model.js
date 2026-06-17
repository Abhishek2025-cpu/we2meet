const mongoose = require("mongoose");

const planInterestSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubscriptionPlan",
        required: true
      },

      clickedAt: {
        type: Date,
        default: Date.now
      }
    },
    {
      timestamps: true
    }
  );

module.exports = mongoose.model(
  "PlanInterest",
  planInterestSchema
);