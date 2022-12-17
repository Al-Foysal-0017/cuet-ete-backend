const express = require("express");
const { addMessage, getMessages } = require("../controllers/MessageController");
const router = express.Router();

router.post("/addMessage", addMessage);

router.get("/getAllMessages/:chatId", getMessages);

module.exports = router;
