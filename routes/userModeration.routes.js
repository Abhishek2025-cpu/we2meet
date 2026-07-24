const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  blockUser,
  unblockUser,
  reportUser,
  getBlockedUsers,
  getReportedUsers
} = require("../controllers/userModeration.controller");

router.post(
  "/block/:userId",
  protect,
  blockUser
);

router.delete(
  "/block/:userId",
  protect,
  unblockUser
);

router.post(
  "/report/:userId",
  protect,
  reportUser
);

router.get(
  "/blocked-users",
  protect,
  getBlockedUsers
);

router.get(
  "/reported-users",
  protect,
  getReportedUsers
);

module.exports = router;