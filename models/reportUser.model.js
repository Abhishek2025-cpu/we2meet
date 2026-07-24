const mongoose = require("mongoose");

const reportUserSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    reason: {
      type: String,
      enum: [
        "Fake Profile",
        "Spam",
        "Harassment",
        "Abusive Behaviour",
        "Inappropriate Photos",
        "Inappropriate Messages",
        "Scam",
        "Other"
      ],
      required: true
    },

    remarks: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

reportUserSchema.index(
  {
    reportedBy: 1,
    reportedUser: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model(
  "ReportedUser",
  reportUserSchema
);