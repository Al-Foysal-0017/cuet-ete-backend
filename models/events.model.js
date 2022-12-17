const mongoose = require("mongoose");

const eventsScheama = new mongoose.Schema(
  {
    date: {
      type: String,
      trim: true,
      required: true,
    },
    month: {
      type: String,
      trim: true,
      required: true,
    },
    year: {
      type: String,
      trim: true,
      required: true,
    },
    particular_date: {
      type: String,
      required: true,
    },
    media: {
      type: String,
      required: true,
    },
    organized_by: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
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

module.exports = mongoose.model("Event", eventsScheama);
