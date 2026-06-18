const express = require("express");

const router =
  express.Router();

const protect = require(
  "../middleware/auth.middleware"
);

const {
  saveFcmToken,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead
} = require(
  "../controllers/notification.controller"
);

router.post(
  "/save-fcm",
  protect,
  saveFcmToken
);

router.get(
  "/",
  protect,
  getMyNotifications
);

router.patch(
  "/:id/read",
  protect,
  markNotificationRead
);

router.patch(
  "/read-all",
  protect,
  markAllNotificationsRead
);

module.exports = router;