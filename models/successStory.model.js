const mongoose = require("mongoose");

const successStorySchema = new mongoose.Schema(
{
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    partnerName:{
        type:String,
        required:true,
        trim:true
    },

    coupleName:{
        type:String
    },

    meetingDate:{
        type:Date,
        required:true
    },

    image:{
        type:String,
        required:true
    },

    story:{
        type:String,
        required:true
    }
},
{
    timestamps:true
}
);

module.exports=mongoose.model(
"SuccessStory",
successStorySchema
);