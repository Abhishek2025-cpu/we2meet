const express = require("express");

const router = express.Router();

const adminProtect = require(
  "../middleware/admin.middleware"
);

const {
  createPlan,
  getAdminPlans,
  getAdminPlanById,
  updatePlan,
  deletePlan,
  changePlanStatus,
  getAllPlanClicks,
  getInterestedUsersByPlan,
  getUserPlanClicks
} = require("../controllers/plan.controller");

router.post(
  "/plans",
  adminProtect,
  createPlan
);

router.get(
  "/plans",
  adminProtect,
  getAdminPlans
);

router.get(
  "/plans/:id",
  adminProtect,
  getAdminPlanById
);

router.patch(
  "/plans/:id",
  adminProtect,
  updatePlan
);

router.delete(
  "/plans/:id",
  adminProtect,
  deletePlan
);

router.patch(
  "/plans/:id/status",
  adminProtect,
  changePlanStatus
);

router.get(
  "/plan-clicks",
  adminProtect,
  getAllPlanClicks
);

router.get(
  "/plans/:id/interested-users",
  adminProtect,
  getInterestedUsersByPlan
);

router.get(
  "/users/:id/plan-clicks",
  adminProtect,
  getUserPlanClicks
);

module.exports = router;