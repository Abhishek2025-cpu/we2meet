const mongoose = require("mongoose");

const profileViewSchema =
  new mongoose.Schema(
    {
      viewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      viewedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      viewCount: {
        type: Number,
        default: 1
      },

      lastViewedAt: {
        type: Date,
        default: Date.now
      }
    },
    {
      timestamps: true
    }
  );

profileViewSchema.index({
  viewerId: 1,
  viewedUserId: 1
});

module.exports = mongoose.model(
  "ProfileView",
  profileViewSchema
);