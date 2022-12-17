const Event = require("../models/events.model");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cloudinary = require("cloudinary");

// Create Event (Admin)
exports.createEvent = catchAsyncErrors(async (req, res, next) => {
  const newEventData = req.body;

  var myCloud = await cloudinary.v2.uploader.upload(
    req.files.img.tempFilePath,
    {
      folder: "events",
    }
  );

  newEventData.img = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };
  const event = await Event.create(newEventData);

  res.status(201).json({
    success: true,
    event,
  });
});

// Get All Events (no auth)
exports.getAllevents = catchAsyncErrors(async (req, res, next) => {
  const count = await Event.find().countDocuments();
  const response = await Event.find().sort({ updatedAt: -1 });
  return res.status(200).json({ response: response, count });
});

// Get Top 3 Events (no auth)
exports.getNew3Event = catchAsyncErrors(async (req, res, next) => {
  const events = await Event.find()
    .sort({
      createdAt: -1,
    })
    .limit(3);
  res.status(200).json({
    success: true,
    events,
  });
});

// Get single Event (no auth)
exports.getSingleEvent = catchAsyncErrors(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorHander(`Event does not exist with Id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    event,
  });
});

// Update Event (Admin)
exports.updateEvent = catchAsyncErrors(async (req, res, next) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    return next(new ErrorHander("Event not found", 404));
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    event,
  });
});

// Delete Event (Admin)
exports.deleteEvent = catchAsyncErrors(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new ErrorHander("Event not found", 404));
  }

  await event.remove();

  res.status(200).json({
    success: true,
    message: "Event Delete Successfully",
  });
});
