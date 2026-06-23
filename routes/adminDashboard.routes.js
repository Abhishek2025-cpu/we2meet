const express = require("express");

const router = express.Router();

const protectAdmin = require(
  "../middleware/admin.middleware"
);

const {
  getDashboard
} = require(
  "../controllers/adminDashboard.controller"
);

router.get(
  "/dashboard",
  protectAdmin,
  getDashboard
);

module.exports = router;