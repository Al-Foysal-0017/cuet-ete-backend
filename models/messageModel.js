const { Schema, model } = require("mongoose");

const MessageSchema = Schema(
  {
    chatId: {
      type: String,
    },
    senderId: {
      type: String,
    },
    text: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Message", MessageSchema);
