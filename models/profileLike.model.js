const mongoose = require("mongoose");

const profileLikeSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },

      likedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    },
    {
      timestamps: true
    }
  );

module.exports = mongoose.model(
  "ProfileLike",
  profileLikeSchema
);