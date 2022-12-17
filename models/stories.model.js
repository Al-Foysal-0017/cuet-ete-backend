const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const storiesScheama = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userImg: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    organized_by: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    like: {
      type: Array,
      default: [],
    },
    img: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Stories", storiesScheama);
