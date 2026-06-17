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
  deleteUserAdmin
} = require(
  "../controllers/admin.controller"
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

module.exports = router;