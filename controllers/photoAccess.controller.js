const PhotoAccessRequest = require(
  "../models/photoAccessRequest.model"
);

const User = require("../models/user.model");

const Notification = require(
  "../models/notification.model"
);

const {
  sendNotification
} = require("../services/notification.service");


// ======================================
// Request Photo Access
// ======================================

exports.requestPhotoAccess = async (
  req,
  res
) => {
  try {

    const requester =
      req.user._id;

    const requestedTo =
      req.params.userId;

    if (
      requester.toString() ===
      requestedTo
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot request access to your own photos."
      });
    }

    const user =
      await User.findById(
        requestedTo
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found"
      });
    }

    const exists =
      await PhotoAccessRequest.findOne({
        requestedBy: requester,
        requestedTo
      });

    if (exists) {
      return res.status(400).json({
        success: false,
        message:
          "Request already exists.",
        status:
          exists.status
      });
    }

    const request =
      await PhotoAccessRequest.create({
        requestedBy: requester,
        requestedTo
      });

    await sendNotification({
      userId: requestedTo,
      tokens: user?.fcmTokens || [],
      title: "Photo Access Request",
      message: `${req.user.legalName} requested access to your photos.`,
      type: "photo_access_request",
      data: {
        requestId: request._id.toString()
      }
    });

    return res.json({
      success: true,
      message:
        "Photo access request sent successfully."
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        error.message
    });

  }
};


// ======================================
// Incoming Requests
// ======================================

exports.getIncomingRequests =
  async (req, res) => {

    try {

      const requests =
        await PhotoAccessRequest.find({
          requestedTo:
            req.user._id,
          status:
            "pending"
        })
          .populate(
            "requestedBy",
            "legalName primaryProfilePhoto photoVisibility age location"
          )
          .sort({
            createdAt: -1
          });

      return res.json({
        success: true,
        count:
          requests.length,
        data:
          requests
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message:
          error.message
      });

    }

  };


// ======================================
// Outgoing Requests
// ======================================

exports.getMyRequests =
  async (req, res) => {

    try {

      const requests =
        await PhotoAccessRequest.find({
          requestedBy:
            req.user._id
        })
          .populate(
            "requestedTo",
            "legalName primaryProfilePhoto photoVisibility"
          )
          .sort({
            createdAt: -1
          });

      return res.json({
        success: true,
        count:
          requests.length,
        data:
          requests
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message:
          error.message
      });

    }

  };


// ======================================
// Approve Request
// ======================================

exports.approveRequest =
  async (req, res) => {

    try {

      const request =
        await PhotoAccessRequest.findOne({
          _id:
            req.params.requestId,
          requestedTo:
            req.user._id
        });

      if (!request) {

        return res.status(404).json({
          success: false,
          message:
            "Request not found"
        });

      }

      request.status =
        "approved";

      request.respondedAt =
        new Date();

      await request.save();

      const sender =
        await User.findById(
          request.requestedBy
        );

      await sendNotification({
        userId: sender._id,
        tokens: sender?.fcmTokens || [],
        title: "Photo Request Approved",
        message: "Your request has been approved.",
        type: "photo_access_approved"
      });

      return res.json({
        success: true,
        message:
          "Request approved successfully."
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message:
          error.message
      });

    }

  };


// ======================================
// Reject Request
// ======================================

exports.rejectRequest =
  async (req, res) => {

    try {

      const request =
        await PhotoAccessRequest.findOne({
          _id:
            req.params.requestId,
          requestedTo:
            req.user._id
        });

      if (!request) {

        return res.status(404).json({
          success: false,
          message:
            "Request not found"
        });

      }

      request.status =
        "rejected";

      request.respondedAt =
        new Date();

      await request.save();

      return res.json({
        success: true,
        message:
          "Request rejected successfully."
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message:
          error.message
      });

    }

  };


// ======================================
// Cancel Request
// ======================================

exports.cancelRequest =
  async (req, res) => {

    try {

      const deleted =
        await PhotoAccessRequest.findOneAndDelete({
          requestedBy:
            req.user._id,
          _id:
            req.params.requestId,
          status:
            "pending"
        });

      if (!deleted) {

        return res.status(404).json({
          success: false,
          message:
            "Request not found"
        });

      }

      return res.json({
        success: true,
        message:
          "Request cancelled successfully."
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message:
          error.message
      });

    }

  };
