const PlanInterest = require("../models/planInterest.model");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const cloudinary = require("../config/cloudinary");
const { sendNotification } = require("../services/notification.service");

exports.sendPlanNotification = async (req, res) => {
  try {
    const { planId } = req.params;
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required"
      });
    }

    const interests = await PlanInterest.find({
      planId
    }).distinct("userId");

    if (!interests.length) {
      return res.status(404).json({
        success: false,
        message: "No users found for this plan"
      });
    }

    const users = await User.find({
      _id: { $in: interests }
    });

    const image = req.file?.path || "";
    let pushSent = 0;

    for (const user of users) {
      await Notification.create({
        userId: user._id,
        title,
        message,
        image,
        type: "plan_notification",
        data: {
          planId
        }
      });

      if (user.fcmTokens && user.fcmTokens.length) {
        await sendNotification({
          userId: user._id,
          tokens: user.fcmTokens,
          title,
          message,
          image,
          type: "plan_notification",
          data: {
            planId
          }
        });

        pushSent++;
      }
    }

    return res.json({
      success: true,
      message: "Notification sent successfully",
      totalUsers: users.length,
      pushSent,
      image
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.sendGenderNotification = async (req, res) => {
  try {
    const { gender } = req.params;
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required"
      });
    }

    const users = await User.find({
      gender: {
        $regex: `^${gender}$`,
        $options: "i"
      },
      isActive: true
    });

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "No users found"
      });
    }

    const image = req.file?.path || "";
    let pushSent = 0;

    for (const user of users) {
      await Notification.create({
        userId: user._id,
        title,
        message,
        image,
        type: "gender_notification",
        data: {
          gender
        }
      });

      if (user.fcmTokens && user.fcmTokens.length) {
        await sendNotification({
          userId: user._id,
          tokens: user.fcmTokens,
          title,
          message,
          image,
          type: "gender_notification",
          data: {
            gender
          }
        });

        pushSent++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Notification sent to ${gender} users successfully`,
      totalUsers: users.length,
      pushSent,
      image
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};