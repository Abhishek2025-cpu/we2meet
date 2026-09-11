const express = require("express");
const router = express.Router();

const {
  getSpamStats,
  getSpamList,
  updateSpamStatus
} = require("../controllers/spam.controller");

const adminProtect = require("../middleware/admin.middleware");

router.get("/stats", adminProtect, getSpamStats);
router.get("/list", adminProtect, getSpamList);
router.patch("/:id/status", adminProtect, updateSpamStatus);

module.exports = router;
