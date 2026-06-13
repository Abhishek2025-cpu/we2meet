const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    profileCreatedFor: { type: String },
    legalName: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    dateOfBirth: { type: Date },
    religion: { type: String },
    caste: { type: String }, 
    motherTongue: { type: String },
    location: {
        city: String,
        state: String
    },
    education: {
        highestQualification: { type: String },
        college: { type: String }
    },
    career: {
        workingWith: { type: String},
        profession: { type: String },
        annualIncome: { type: String }
    },
    familyDetails: {
        familyStatus: { type: String },
        familyType: { type: String, enum: ['Joint', 'Nuclear'] },
        familyValues: { type: String, enum: ['Traditional', 'Moderate', 'Liberal'] },
        fatherOccupation: { type: String },
        motherOccupation: { type: String },
        aboutFamily: { type: String } 
    },
    partnerPreferences: {
        ageRange: {
            min: { type: Number },
            max: { type: Number}
        },
        heightRange: {
            min: { type: String },
            max: { type: String }
        },
        maritalStatus: [{ type: String }], 
        religions: [{ type: String }],
        motherTongues: [{ type: String }]
    },

    lifestyle: {
        dietaryPreference: { type: String, enum: ['Veg', 'Non-Veg', 'Eggetarian', 'Vegan'] },
        smoking: { type: String, enum: ['No', 'Yes', 'Occasionally'] },
        drinking: { type: String, enum: ['No', 'Yes', 'Occasionally'] },
        interests: [{ type: String }] 
    },
    photos: {
        primaryPhoto: { type: String }, 
        gallery: [{ type: String }]    
    },

    bio: { type: String, maxLength: 1000 },
    valuesAndAspirations: [{ type: String }],
    majorLifeGoal: { type: String },

    verification: {
        isIdentityVerified: { type: Boolean, default: false }, 
        isMobileVerified: { type: Boolean, default: false },
        isProfessionalVerified: { type: Boolean, default: false } 
    },

    horoscope: {
        placeOfBirth: { type: String },
        timeOfBirth: { type: String },
        dateOfBirth: Date,
        gothra: { type: String },
        manglikStatus: { type: String }
    },

    profileCompletionPercentage: { type: Number, default: 0 },
    profileCompleted: {
        type: Boolean,
        default: false,
    },

    isTermsAccepted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);