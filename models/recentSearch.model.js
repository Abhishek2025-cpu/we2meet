const mongoose = require("mongoose");

const recentSearchSchema =
  new mongoose.Schema(
    {
      userId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      searchedUserId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    },
    {
      timestamps: true
    }
  );

module.exports =
  mongoose.model(
    "RecentSearch",
    recentSearchSchema
  );