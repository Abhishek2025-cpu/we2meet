const mongoose = require("mongoose");

const successStorySchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      image: {
        type: String,
        required: true
      },

      story: {
        type: String,
        required: true
      }
    },
    {
      timestamps: true
    }
  );

module.exports = mongoose.model(
  "SuccessStory",
  successStorySchema
);