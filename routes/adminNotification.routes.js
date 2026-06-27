const express = require("express");

const router = express.Router();

const adminProtect = require("../middleware/admin.middleware");

const upload = require("../middleware/upload.middleware");

const {
sendPlanNotification
} = require("../controllers/adminNotification.controller");

router.post(
"/plan/:planId/send",
adminProtect,
upload.single("image"),
sendPlanNotification
);

module.exports = router;
