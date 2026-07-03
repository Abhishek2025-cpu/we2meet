const express = require("express");

const router = express.Router();

const adminProtect = require("../middleware/admin.middleware");

const upload = require("../middleware/upload.middleware");

const {
sendPlanNotification,
  sendGenderNotification
} = require("../controllers/adminNotification.controller");

router.post(
"/plan/:planId/send",
adminProtect,
upload.single("image"),
sendPlanNotification
);

router.post(
  "/gender/:gender/send",
  adminProtect,
  upload.single("image"),
  sendGenderNotification
);

module.exports = router;
