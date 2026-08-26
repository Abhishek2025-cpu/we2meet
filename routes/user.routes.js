const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload.middleware");
const protect = require("../middleware/auth.middleware");

const {
  createUser,
  login,
  forgotPassword,
  verifyForgotPasswordOTP,
  resetPassword,
  updateUser,
  getAllUsers,
  getUserById,
  getRecentJoins,
  incrementFreeCount,
  changePassword,
  deactivateAccount,
  activateAccount,
  deleteAccount,
  togglePhotoVisibility,
  toggleContactVisibility,
  getContactVisibility
} = require("../controllers/user.controller");

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
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyForgotPasswordOTP);
router.post("/reset-password", resetPassword);

// ==========================
// Protected Routes
// ==========================

router.patch(
  "/photo-visibility",
  protect,
  togglePhotoVisibility
);

router.patch(
  "/contact-visibility",
  protect,
  toggleContactVisibility
);

router.get(
  "/contact-visibility",
  protect,
  getContactVisibility
);



router.get(
  "/",
  protect,
  getAllUsers
);

router.get(
  "/recent-joins",
  protect,
  getRecentJoins
);

// ==========================
// Account Management
// (Keep these before /:id)
// ==========================

router.patch(
  "/change-password",
  protect,
  changePassword
);

router.patch(
  "/deactivate",
  protect,
  deactivateAccount
);

router.patch(
  "/activate",
  protect,
  activateAccount
);

router.delete(
  "/delete-account",
  protect,
  deleteAccount
);

// ==========================
// User Specific Routes
// ==========================

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