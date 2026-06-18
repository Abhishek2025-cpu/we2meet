const mongoose = require("mongoose");

const reportSchema =
  new mongoose.Schema(
    {
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },

      reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },

      reason: String,

      description: String
    },
    {
      timestamps: true
    }
  );

module.exports = mongoose.model(
  "Report",
  reportSchema
);