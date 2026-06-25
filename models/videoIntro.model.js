const mongoose = require("mongoose");

const videoIntroSchema =
new mongoose.Schema(
{
userId: {
type:
mongoose.Schema.Types.ObjectId,
ref: "User",
required: true
},


  videoUrl: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  isActive: {
    type: Boolean,
    default: true
  }
},
{
  timestamps: true
}


);

module.exports =
mongoose.model(
"VideoIntro",
videoIntroSchema
);
