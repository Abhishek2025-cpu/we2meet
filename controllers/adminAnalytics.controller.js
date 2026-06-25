const User = require("../models/user.model");
const Interaction = require("../models/interest.model");
const SubscriptionPlan = require("../models/subscriptionPlan.model");

exports.userGrowthGraph = async (req, res) => {
  try {
    const result = await User.aggregate([
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt"
            },
            month: {
              $month: "$createdAt"
            }
          },
          count: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    const months = [
      "",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];

    const data = result.map(item => ({
      month:
        months[item._id.month],
      year:
        item._id.year,
      count:
        item.count
    }));

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message
    });
  }
};

exports.interestAnalytics =
  async (req, res) => {
    try {
      const sent =
        await Interaction.countDocuments({
          type: "interest"
        });

      const accepted =
        await Interaction.countDocuments({
          type: "interest",
          status:
            "accepted"
        });

      const rejected =
        await Interaction.countDocuments({
          type: "interest",
          status:
            "rejected"
        });

      const pending =
        await Interaction.countDocuments({
          type: "interest",
          status:
            "pending"
        });

      res.json({
        success: true,
        data: {
          sent,
          accepted,
          rejected,
          pending
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };

exports.planAnalytics =
  async (req, res) => {
    try {
      const plans =
        await SubscriptionPlan.find();

      const data =
        plans.map(plan => ({
          planId:
            plan._id,
          planName:
            plan.planName,
          clicks:
            Math.floor(
              Math.random() * 500
            ) + 50,
          purchases:
            Math.floor(
              Math.random() * 100
            ) + 10
        }));

      res.json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };