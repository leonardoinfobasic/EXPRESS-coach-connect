const express = require("express");
const {
  getMessages,
  sendMessage,
  markAsRead,
  getConversations,
  getConversation,
  markConversationAsRead // ✅ aggiunto
} = require("../controllers/message.controller");
const { authJwt } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/conversations", authJwt, getConversations);
router.get("/conversations/:userId", authJwt, getConversation);

router.get("/:clientId", authJwt, getMessages);
router.post("/", authJwt, sendMessage);
router.patch("/:id/read", authJwt, markAsRead);

// ✅ nuova rotta per marcare tutta la conversazione come letta
router.post("/messages/:userId/read", authJwt, markConversationAsRead);

module.exports = router;
