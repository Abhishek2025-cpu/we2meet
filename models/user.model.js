const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    createdFor: {
      type: String,
      enum: ["Self", "Son", "Daughter", "Brother", "Sister", "Friend", "Relative"],
      required: true
    },

    legalName: {
      type: String,
      required: true
    },

    email: {
      type: String,
      unique: true,
      sparse: true
    },

    isActive: {
  type: Boolean,
  default: true
},

    phone: {
      type: String,
      unique: true,
      required: true
    },

    password: {
      type: String,
      required: true
    },

    gender: String,
    dob: Date,

    religion: String,
    caste: String,
    subCaste: String,

    motherTongue: String,

    qualification: String,
    college: String,

    workingWith: String,
    profession: String,

    annualIncome: Number,

    profiles: [
      {
        platform: String,
        url: String
      }
    ],

    familyDetails: {
      familyStatus: String,
      familyType: String,
      familyValues: String,

      parentDetails: {
        fatherOccupation: String,
        motherOccupation: String
      },

      aboutFamily: String
    },

    partnerPreference: {
      ageRange: {
        min: Number,
        max: Number
      },

      heightRange: {
        min: Number,
        max: Number
      },

      maritalStatus: [String],

      religions: [String],

      motherTongues: [String]
    },

    lifeStyleDetails: {
      dietaryPreference: [String],
      smoking: Boolean,
      drinking: Boolean,
      interestAndHobbies: [String]
    },

    myStory: {
      aboutMe: String,
      values: [String],
      lifeGoal: String
    },

    kundaliDetails: {
      dob: Date,
      pob: String,
      gotra: String,
      manglik: Boolean,
       kundaliPhotos: [
    {
      type: String
    }
  ]
    },
    primaryProfilePhoto: {
  type: String,
  default: null
},

 profilePhotos: [
  {
    type: String
  }
],

    profileCompletionPercentage: {
      type: Number,
      default: 0
    },

    freeUsedCount: {
      type: Number,
      default: 0
    },

    maxFreeLimit: {
      type: Number,
      default: 5
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", UserSchema);