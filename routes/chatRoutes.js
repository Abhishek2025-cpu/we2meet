const express = require("express");
const router = express.Router();

const {
  createConversation,
  sendMessage,
  getMessages,
  getConversations,
  editMessage,
  deleteMessage,
  clearChat,
  getUnreadCount,
  markAsRead
} = require("../controllers/chatController");

const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/conversation", authMiddleware, createConversation);

router.post("/message", authMiddleware, upload.array("file",5), sendMessage);

router.get("/message/:conversationId", authMiddleware, getMessages);

router.get("/conversation/:userId", authMiddleware, getConversations);

router.put("/message/edit", authMiddleware, editMessage);

router.put("/message/delete", authMiddleware, deleteMessage);

router.put("/chat/clear", authMiddleware, clearChat);

router.get("/unread", authMiddleware, getUnreadCount);

router.put("/message/read", authMiddleware, markAsRead);

module.exports = router;