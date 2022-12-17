const express = require("express");
const router = express.Router();
const {
  isAuthenticatedUser,
  authorizeRoleAdmin,
} = require("../middleware/auth");

const {
  createStories,
  getAllStories,
  getSingleStory,
  updateStory,
  deleteStory,
  storyComment,
  getAllStoryOfaUser,
  likeAStory,
  getNew3Stories,
} = require("../controllers/stories.controller");

// auth
router.post("/create/story", isAuthenticatedUser, createStories);
router.post("/story/comment", isAuthenticatedUser, storyComment);
router.put("/story/like/:id", isAuthenticatedUser, likeAStory);
router.get("/all/story/:id", getAllStoryOfaUser);
router
  .route("/story/:id")
  .put(isAuthenticatedUser, updateStory)
  .delete(isAuthenticatedUser, deleteStory);

// no auth
router.get("/stories", getAllStories);
router.route("/story/:id").get(getSingleStory);
router.get("/story/three/request", getNew3Stories);

module.exports = router;
