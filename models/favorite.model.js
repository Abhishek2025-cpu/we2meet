const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    favoriteUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

// These are the access patterns used by the member and admin favourite lists.
favoriteSchema.index({ userId: 1, createdAt: -1 });
favoriteSchema.index({ favoriteUserId: 1, createdAt: -1 });
favoriteSchema.index({ createdAt: -1 });

module.exports = mongoose.model(
  "Favorite",
  favoriteSchema
);
