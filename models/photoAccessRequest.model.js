const mongoose = require("mongoose");

const photoAccessRequestSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    requestedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected"
      ],
      default: "pending"
    },

    respondedAt: Date
  },
  {
    timestamps: true
  }
);

photoAccessRequestSchema.index({
  requestedBy: 1,
  requestedTo: 1
}, {
  unique: true
});

module.exports = mongoose.model(
  "PhotoAccessRequest",
  photoAccessRequestSchema
);