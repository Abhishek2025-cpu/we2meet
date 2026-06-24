const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload.middleware");
const protect = require("../middleware/auth.middleware");

const {
  createUser,
  login,
  updateUser,
  getAllUsers,
  getUserById,
  getRecentJoins,
  incrementFreeCount
} = require("../controllers/user.controller");

// Public Routes
router.post(
  "/register",
upload.fields([
  {
    name: "primaryProfilePhoto",
    maxCount: 1
  },
  {
    name: "profilePhoto",
    maxCount: 12
  },
  {
    name: "kundaliPhoto",
    maxCount: 10
  }
]),
  createUser
);

router.post("/login", login);

// Protected Routes
router.get("/", protect, getAllUsers);

router.get(
  "/recent-joins",
  protect,
  getRecentJoins
);

router.patch(
  "/:id/free-count",
  protect,
  incrementFreeCount
);

router.patch(
  "/:id",
  protect,
  upload.fields([
    {
      name: "primaryProfilePhoto",
      maxCount: 1
    },
    {
      name: "profilePhoto",
      maxCount: 12
    },
    {
      name: "kundaliPhoto",
      maxCount: 10
    }
  ]),
  updateUser
);

router.get(
  "/:id",
  protect,
  getUserById
);

module.exports = router;