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
} = require("../controllers/chatController");

const upload = require("../middlewares/upload");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/conversation", authMiddleware, createConversation);

router.post("/message", authMiddleware, upload.single("file"), sendMessage);

router.get("/messages/:conversationId", authMiddleware, getMessages);

router.get("/conversations/:userId", authMiddleware, getConversations);

router.put("/message/edit", authMiddleware, editMessage);

router.put("/message/delete", authMiddleware, deleteMessage);

router.put("/chat/clear", authMiddleware, clearChat);

router.get("/unread/:userId", authMiddleware, getUnreadCount);

module.exports = router;