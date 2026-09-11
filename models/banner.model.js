const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    imageUrl: {
      type: String,
      required: true
    },
    targetUrl: {
      type: String,
      default: ""
    },
    position: {
      type: String,
      enum: ["Header", "Home", "Sidebar", "Footer"],
      default: "Header"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Banner", bannerSchema);
