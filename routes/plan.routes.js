const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  getAllPlans,
  getPlanById,
  clickPlan
} = require("../controllers/plan.controller");

router.get("/", protect, getAllPlans);

router.get("/:id", protect, getPlanById);

router.post("/click", protect, clickPlan);

module.exports = router;
