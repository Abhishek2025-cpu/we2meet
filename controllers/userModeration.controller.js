const User = require("../models/user.model");
const BlockedUser = require("../models/blockUser.model");
const ReportedUser = require("../models/reportUser.model");

exports.blockUser = async (req, res) => {
  try {

    const blockedBy = req.user._id;
    const blockedUser = req.params.userId;

    if (blockedBy.toString() === blockedUser) {
      return res.status(400).json({
        success: false,
        message: "You cannot block yourself."
      });
    }

    const exists = await BlockedUser.findOne({
      blockedBy,
      blockedUser
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "User already blocked."
      });
    }

    await BlockedUser.create({
      blockedBy,
      blockedUser,
      reason: req.body.reason || ""
    });

    return res.status(200).json({
      success: true,
      message: "User blocked successfully."
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.unblockUser = async (req, res) => {

  try {

    const blockedBy = req.user._id;
    const blockedUser = req.params.userId;

    await BlockedUser.findOneAndDelete({
      blockedBy,
      blockedUser
    });

    return res.status(200).json({
      success: true,
      message: "User unblocked successfully."
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

exports.reportUser = async (req, res) => {

  try {

    const reportedBy = req.user._id;
    const reportedUser = req.params.userId;

    const {
      reason,
      remarks
    } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required."
      });
    }

    const exists = await ReportedUser.findOne({
      reportedBy,
      reportedUser
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this user."
      });
    }

    await ReportedUser.create({
      reportedBy,
      reportedUser,
      reason,
      remarks
    });

    const totalReports =
      await ReportedUser.countDocuments({
        reportedUser
      });

    if (totalReports >= 100) {

      await User.findByIdAndUpdate(
        reportedUser,
        {
          isActive: false
        }
      );

    }

    return res.status(200).json({
      success: true,
      message: "User reported successfully.",
      totalReports
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

exports.getBlockedUsers = async (req, res) => {

  try {

    const users =
      await BlockedUser.find({
        blockedBy: req.user._id
      })
      .populate(
        "blockedUser",
        "legalName primaryProfilePhoto phone gender profession"
      )
      .sort({
        createdAt: -1
      });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

exports.getReportedUsers = async (req, res) => {

  try {

    const reports =
      await ReportedUser.find({
        reportedBy: req.user._id
      })
      .populate(
        "reportedUser",
        "legalName primaryProfilePhoto phone"
      )
      .sort({
        createdAt: -1
      });

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};