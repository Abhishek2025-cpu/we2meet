const express = require("express");

const router = express.Router();

const upload = require(
  "../middleware/upload.middleware"
);

const protect = require(
  "../middleware/auth.middleware"
);

const {
  createSuccessStory,
  getAllSuccessStories,
  getSuccessStoryById,
  updateSuccessStory,
  deleteSuccessStory
} = require(
  "../controllers/successStory.controller"
);

router.post(
  "/",
  protect,
  upload.single("image"),
  createSuccessStory
);

router.get(
  "/",
  getAllSuccessStories
);

router.get(
  "/:id",
  getSuccessStoryById
);

router.patch(
  "/:id",
  protect,
  upload.single("image"),
  updateSuccessStory
);

router.delete(
  "/:id",
  protect,
  deleteSuccessStory
);

module.exports = router;