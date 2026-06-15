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
  incrementFreeCount
} = require("../controllers/user.controller");

router.post(
  "/register",
  upload.fields([
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

router.get("/", protect, getAllUsers);

router.get("/:id", protect, getUserById);

router.patch(
  "/:id",
  protect,
  upload.fields([
    {
      name: "profilePhoto",
      maxCount: 12
    },
    {
      name: "kundaliPhoto",
      maxCount: 5
    }
  ]),
  updateUser
);

router.patch(
  "/:id/free-count",
  protect,
  incrementFreeCount
);

module.exports = router;