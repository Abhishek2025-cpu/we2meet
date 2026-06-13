const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['Silver', 'Gold', 'Elite Diamond'],
        unique: true
    },
    durationMonths: {
        type: Number,
        required: true
    },
    basePrice: {
        type: Number,
        required: true
    },
    gstPercentage: {
        type: Number,
        default: 18
    },
    taxAmount: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    features: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);