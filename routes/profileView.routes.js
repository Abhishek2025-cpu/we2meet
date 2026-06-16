const express = require("express");

const router = express.Router();

const protect = require(
  "../middleware/auth.middleware"
);

const {
  addProfileView,
  getViewedMe,
  getIViewed,
  getRecentViewedMe
} = require(
  "../controllers/profileView.controller"
);

router.post(
  "/",
  protect,
  addProfileView
);

router.get(
  "/viewed-me",
  protect,
  getViewedMe
);

router.get(
  "/i-viewed",
  protect,
  getIViewed
);

router.get(
  "/recent-viewed-me",
  protect,
  getRecentViewedMe
);

module.exports = router;