const express = require("express");
const router = express.Router();

const protect = require(
  "../middleware/auth.middleware"
);

const {
  sendInterest,
  acceptInterest,
  rejectInterest,

  addFavorite,
  removeFavorite,
  getFavorites,

  likeProfile,
  removeLike,
  getLikes,

  reportProfile,
  getReports,

  getSentInterests,
  getReceivedInterests
} = require(
  "../controllers/interaction.controller"
);

// ================= INTEREST =================

router.post(
  "/interest/send",
  protect,
  sendInterest
);

router.patch(
  "/interest/:id/accept",
  protect,
  acceptInterest
);

router.patch(
  "/interest/:id/reject",
  protect,
  rejectInterest
);

router.get(
  "/interests/sent",
  protect,
  getSentInterests
);

router.get(
  "/interests/received",
  protect,
  getReceivedInterests
);

// ================= FAVORITES =================

router.post(
  "/favorite",
  protect,
  addFavorite
);

router.get(
  "/favorites",
  protect,
  getFavorites
);

router.delete(
  "/favorite/:id",
  protect,
  removeFavorite
);

// ================= LIKES =================

router.post(
  "/like",
  protect,
  likeProfile
);

router.get(
  "/likes",
  protect,
  getLikes
);

router.delete(
  "/like/:id",
  protect,
  removeLike
);

// ================= REPORTS =================

router.post(
  "/report",
  protect,
  reportProfile
);

router.get(
  "/reports",
  protect,
  getReports
);

module.exports = router;