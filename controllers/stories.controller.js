const cloudinary = require("cloudinary");
const Stories = require("../models/stories.model");
const StoryComment = require("../models/storyComment");
const User = require("../models/auth.model");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// Create Stories (auth)
exports.createStories = catchAsyncErrors(async (req, res, next) => {
  const newStoryData = req.body;

  var myCloud = await cloudinary.v2.uploader.upload(
    req.files.img.tempFilePath,
    {
      folder: "stories",
    }
  );

  newStoryData.img = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  const story = await Stories.create(newStoryData);

  res.status(201).json({
    success: true,
    story,
  });
});

// Get All Stories (no auth)
exports.getAllStories = catchAsyncErrors(async (req, res, next) => {
  const count = await Stories.find().countDocuments();
  const response = await Stories.find().sort({ createdAt: -1 });
  return res.status(200).json({ response: response, count });
});

// Get new 3 three stories (no auth)
exports.getNew3Stories = catchAsyncErrors(async (req, res, next) => {
  const stories = await Stories.find()
    .sort({
      createdAt: -1,
    })
    .limit(3);
  res.status(200).json({
    success: true,
    stories,
  });
});

// Get single Story (no auth)
exports.getSingleStory = catchAsyncErrors(async (req, res, next) => {
  const story = await Stories.findById(req.params.id);

  const responseComments = [];

  const comments = await StoryComment.find({ commentId: story._id }).sort({
    updatedAt: -1,
  });

  for (let i = 0; i < comments.length; i++) {
    const userComment = comments[i];
    const commentWithUserID = comments[i].userId;
    const commentUser = await User.findById(commentWithUserID);
    responseComments.push({ userComment, commentUser });
  }

  if (!story) {
    return next(
      new ErrorHander(`Story does not exist with Id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    story,
    responseComments,
  });
});

//like / dislike story (auth)
exports.likeAStory = catchAsyncErrors(async (req, res, next) => {
  try {
    const story = await Stories.findById(req.params.id);
    if (!story.like.includes(req.body.userId)) {
      await story.updateOne({ $push: { like: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await story.updateOne({ $pull: { like: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update Story (auth)
exports.updateStory = catchAsyncErrors(async (req, res, next) => {
  let story = await Stories.findById(req.params.id);

  if (!story) {
    return next(new ErrorHander("Event not found", 404));
  }

  story = await Stories.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    story,
  });
});

// Delete Story (auth)
exports.deleteStory = catchAsyncErrors(async (req, res, next) => {
  const story = await Stories.findById(req.params.id);

  if (!story) {
    return next(
      new ErrorHander(`Story does not exist with Id: ${req.params.id}`, 400)
    );
  }

  const imageId = story.img.public_id;

  await cloudinary.v2.uploader.destroy(imageId);

  await story.remove();

  res.status(200).json({
    success: true,
    message: "Story Deleted Successfully",
  });
});

// Story Comment (auth)
exports.storyComment = catchAsyncErrors(async (req, res, next) => {
  const { commentId, comment, userId } = req.body;

  const response = await StoryComment.create({
    commentId,
    comment,
    userId,
  });
  return res
    .status(200)
    .json({ success: true, response, msg: "Your comment has been published" });
});

// Get all story post by a single user (auth)
exports.getAllStoryOfaUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`)
    );
  }

  const stories = await Stories.find({ userId: user._id }).sort({
    updatedAt: -1,
  });

  res.status(200).json({
    success: true,
    stories,
  });
});
