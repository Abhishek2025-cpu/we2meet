const ReportUser = require("../models/reportUser.model");
const User = require("../models/user.model");

exports.getSpamStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalSpamReports,
      pendingSpam,
      resolvedSpam,
      todaySpam,
      topSpamUsers
    ] = await Promise.all([
      ReportUser.countDocuments({ reason: "Spam" }),
      ReportUser.countDocuments({ reason: "Spam", status: "pending" }),
      ReportUser.countDocuments({ reason: "Spam", status: "resolved" }),
      ReportUser.countDocuments({
        reason: "Spam",
        createdAt: { $gte: today }
      }),
      ReportUser.aggregate([
        { $match: { reason: "Spam" } },
        { $group: { _id: "$reportedUser", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    const formattedTopSpamUsers = await Promise.all(
      topSpamUsers.map(async (item) => {
        const user = await User.findById(item._id).select("legalName email phone");

        return {
          user,
          count: item.count
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        totalSpamReports,
        pendingSpam,
        resolvedSpam,
        todaySpam,
        topSpamUsers: formattedTopSpamUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getSpamList = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "all" } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const filter = { reason: "Spam" };
    if (status !== "all") {
      filter.status = status;
    }

    const total = await ReportUser.countDocuments(filter);

    const reports = await ReportUser.find(filter)
      .populate("reportedBy", "legalName email phone")
      .populate("reportedUser", "legalName email phone primaryProfilePhoto isActive")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber) || 1,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateSpamStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatus = ["pending", "reviewed", "resolved", "dismissed"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid spam status"
      });
    }

    const report = await ReportUser.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Spam report not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Spam status updated successfully",
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteSpamReport = async (req, res) => {
  try {
    const report = await ReportUser.findOneAndDelete({
      _id: req.params.id,
      reason: "Spam"
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Spam report not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Spam report deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
