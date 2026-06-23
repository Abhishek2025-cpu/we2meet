const User = require("../models/user.model");
const Admin = require("../models/admin.model");
const SubscriptionPlan = require("../models/subscriptionPlan.model");
const PlanInterest = require("../models/planInterest.model");
const Interaction = require("../models/interest.model");

exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalAdmins =
      await Admin.countDocuments();

    const activePlans =
      await SubscriptionPlan.countDocuments({
        isActive: true
      });

    const totalPlanClicks =
      await PlanInterest.countDocuments();

    const totalInterests =
      await Interaction.countDocuments({
        type: "interest"
      });

    const acceptedInterests =
      await Interaction.countDocuments({
        type: "interest",
        status: "accepted"
      });

    const rejectedInterests =
      await Interaction.countDocuments({
        type: "interest",
        status: "rejected"
      });

    const totalFavorites =
      await Interaction.countDocuments({
        type: "favorite"
      });

    const totalLikes =
      await Interaction.countDocuments({
        type: "like"
      });

    const totalReports =
      await Interaction.countDocuments({
        type: "report"
      });

    const recentUsers =
      await User.find()
        .select(
          "legalName phone gender createdAt primaryProfilePhoto"
        )
        .sort({ createdAt: -1 })
        .limit(10);

    const recentPlanClicks =
      await PlanInterest.find()
        .populate(
          "userId",
          "legalName phone"
        )
        .populate(
          "planId",
          "planName price"
        )
        .sort({
          createdAt: -1
        })
        .limit(10);

    const monthlyUsers =
      await User.aggregate([
        {
          $group: {
            _id: {
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
            "_id.month": 1
          }
        }
      ]);

    const genderStats =
      await User.aggregate([
        {
          $group: {
            _id: "$gender",
            count: {
              $sum: 1
            }
          }
        }
      ]);

    const religionStats =
      await User.aggregate([
        {
          $group: {
            _id: "$religion",
            count: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            count: -1
          }
        }
      ]);

    const planStats =
      await PlanInterest.aggregate([
        {
          $group: {
            _id: "$planId",
            count: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            count: -1
          }
        }
      ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalAdmins,
          activePlans,
          totalPlanClicks,
          totalInterests,
          acceptedInterests,
          rejectedInterests,
          totalFavorites,
          totalLikes,
          totalReports
        },

        charts: {
          monthlyUsers,
          genderStats,
          religionStats,
          planStats
        },

        recentUsers,
        recentPlanClicks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};