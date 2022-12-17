const express = require("express");
const {
  createChat,
  userChats,
  findChat,
} = require("../controllers/ChatController");
const router = express.Router();
router.post("/create/chat", createChat);
router.get("/allChatUserList/:userId", userChats);
router.get("/find/:firstId/:secondId", findChat);

module.exports = router;
