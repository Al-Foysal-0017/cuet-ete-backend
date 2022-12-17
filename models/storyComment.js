const { Schema, model } = require("mongoose");
const storyCommentSchema = new Schema(
  {
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "stories",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = model("storyComment", storyCommentSchema);
