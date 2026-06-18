const User = require(
  "../models/user.model"
);

const Notification = require(
  "../models/notification.model"
);

exports.saveFcmToken =
  async (req, res) => {
    try {
      const { fcmToken } =
        req.body;

      if (!fcmToken) {
        return res.status(400).json({
          success: false,
          message:
            "FCM token is required"
        });
      }

      const user =
        await User.findById(
          req.user._id
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found"
        });
      }

      if (
        !user.fcmTokens?.includes(
          fcmToken
        )
      ) {
        user.fcmTokens = [
          ...(user.fcmTokens ||
            []),
          fcmToken
        ];

        await user.save();
      }

      return res.status(200).json({
        success: true,
        message:
          "FCM token saved successfully"
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };

exports.getMyNotifications =
  async (req, res) => {
    try {
      const notifications =
        await Notification.find({
          userId:
            req.user._id
        }).sort({
          createdAt: -1
        });

      return res.status(200).json({
        success: true,
        count:
          notifications.length,
        data: notifications
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };

exports.markNotificationRead =
  async (req, res) => {
    try {
      const notification =
        await Notification.findByIdAndUpdate(
          req.params.id,
          {
            isRead: true
          },
          {
            new: true
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "Notification marked as read",
        data: notification
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };

exports.markAllNotificationsRead =
  async (req, res) => {
    try {
      await Notification.updateMany(
        {
          userId:
            req.user._id,
          isRead: false
        },
        {
          $set: {
            isRead: true
          }
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "All notifications marked as read"
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };