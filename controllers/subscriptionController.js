const SubscriptionPlan = require('../models/SubscriptionPlan');

exports.createOrUpdatePlan = async (req, res) => {
    try {
        const { name, durationMonths, basePrice, gstPercentage, features, isActive } = req.body;

        if (!name || !durationMonths || basePrice === undefined) {
            return res.status(400).json({ success: false, message: "Required fields are missing" });
        }

        const gst = gstPercentage !== undefined ? gstPercentage : 18;
        const taxAmount = Math.round((basePrice * gst) / 100);
        const totalPrice = basePrice + taxAmount;

        const planData = {
            name,
            durationMonths,
            basePrice,
            gstPercentage: gst,
            taxAmount,
            totalPrice,
            features,
            isActive
        };

        const existingPlan = await SubscriptionPlan.findOne({ name });

        if (existingPlan) {
            const updatedPlan = await SubscriptionPlan.findOneAndUpdate(
                { name },
                planData,
                { new: true, runValidators: true }
            );
            return res.status(200).json({
                success: true,
                message: "Plan updated successfully",
                plan: updatedPlan
            });
        }

        const newPlan = new SubscriptionPlan(planData);
        await newPlan.save();

        res.status(201).json({
            success: true,
            message: "Plan created successfully",
            plan: newPlan
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.find({ isActive: true });
        res.status(200).json({
            success: true,
            count: plans.length,
            plans
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPlanById = async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: "Plan not found" });
        }
        res.status(200).json({ success: true, plan });
    } catch (error) {
        res.status(500).json({ success: false, message: "Invalid Plan ID or Server Error" });
    }
};

exports.deletePlan = async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: "Plan not found" });
        }
        res.status(200).json({ success: true, message: "Plan deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};