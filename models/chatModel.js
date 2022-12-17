const { Schema, model } = require("mongoose");

const ChatSchema = Schema(
  {
    members: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Chat", ChatSchema);
