const express = require("express");
const router = express.Router();

const { createStory,getMyStories,updateStory,deleteStory, getAllStories} = require("../controllers/homeController");
const  authMiddleware  = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

router.post("/success-stories/create", authMiddleware, upload.array("images", 3),createStory);

router.get("/success-stories/all", authMiddleware,getAllStories);

router.get("/success-stories/my-stories", authMiddleware, getMyStories);

router.put("/success-stories/:id", authMiddleware,  upload.array("images", 3), updateStory);

router.delete("/success-stories/:id", authMiddleware, deleteStory);

module.exports = router;

