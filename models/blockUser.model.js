const mongoose = require("mongoose");

const blockUserSchema = new mongoose.Schema(
  {
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    blockedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    reason: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

blockUserSchema.index(
  {
    blockedBy: 1,
    blockedUser: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model(
  "BlockedUser",
  blockUserSchema
);