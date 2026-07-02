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
  activateUser
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
  "/plan-clicks",
  adminProtect,
  getAllPlanClicks
);


module.exports = router;