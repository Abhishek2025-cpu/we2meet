const express = require("express");
const router = express.Router();

const adminProtect = require(
  "../middleware/admin.middleware"
);

const {
  createAdmin,
  adminLogin,
  updateAdmin,
  deleteAdmin,
  getAllUsersAdmin,
  getUserByIdAdmin,
  getAllAdmins,
  deleteUserAdmin,
    getAllPlanClicks,
      suspendUser,
  activateUser,
  getAllBlockedUsers,
  searchAndFilterUsers,
  getAllReportedUsers,
  getReportedUserDetails,
  getUserBlockedList,
  removeBlockedUser,
  getModerationDashboard,

} = require(
  "../controllers/admin.controller"
);

const {
  userGrowthGraph,
  interestAnalytics,
  planAnalytics
} = require(
  "../controllers/adminAnalytics.controller"
);

router.post(
  "/create",
  createAdmin
);

router.post(
  "/login",
  adminLogin
);

router.get(
  "/users/search",
  adminProtect,
  searchAndFilterUsers
);
router.patch(
  "/users/:id/suspend",
  adminProtect,
  suspendUser
);

router.patch(
  "/users/:id/activate",
  adminProtect,
  activateUser
);

router.get(
  "/",
  adminProtect,
  getAllAdmins
);
router.patch(
  "/:id",
  adminProtect,
  updateAdmin
);

router.delete(
  "/:id",
  adminProtect,
  deleteAdmin
);

router.get(
  "/users",
  adminProtect,
  getAllUsersAdmin
);

router.get(
  "/users/:id",
  adminProtect,
  getUserByIdAdmin
);

router.delete(
  "/users/:id",
  adminProtect,
  deleteUserAdmin
);


router.get(
  "/user-growth",
  adminProtect,
  userGrowthGraph
);

// ================================
// Moderation Dashboard
// ================================

router.get(
  "/moderation/dashboard",
  adminProtect,
  getModerationDashboard
);

// ================================
// Reports
// ================================

// Get all reported users
router.get(
  "/reported-users",
  adminProtect,
  getAllReportedUsers
);

// Report history of a specific user
router.get(
  "/reported-users/:userId",
  adminProtect,
  getReportedUserDetails
);

// Top most reported users


// ================================
// Blocks
// ================================

// Users blocked by a particular user
router.get(
  "/users/:userId/blocked",
  adminProtect,
  getUserBlockedList
);

// Remove a block relation
router.delete(
  "/block/:blockId",
  adminProtect,
  removeBlockedUser
);








router.get(
  "/interest-analytics",
  adminProtect,
  interestAnalytics
);

router.get(
  "/plan-analytics",
  adminProtect,
  planAnalytics
);

router.get(
  "/blocked-users",
  adminProtect,
  getAllBlockedUsers
);
router.get(
  "/plan-clicks",
  adminProtect,
  getAllPlanClicks
);


module.exports = router;