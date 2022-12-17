const express = require("express");
const router = express.Router();
const {
  isAuthenticatedUser,
  authorizeRoleAdmin,
} = require("../middleware/auth");
const {
  signUp,
  verifyOtp,
  signinController,
  getAllUser,
  updateUserRole,
  updateProfile,
  getSingleUser,
  deleteUser,
  getNew3User,
  getSingleUserByStudentID,
} = require("../controllers/auth.controller");

// no auth
router.route("/signup").post(signUp);
router.route("/signup/verify").post(verifyOtp);
router.post("/signin", signinController);
router.get("/users/request", getAllUser);
router.get("/users/three/request", getNew3User);
router.get("/user/:id", getSingleUser);
router.get("/user/student/:id", getSingleUserByStudentID);

// auth
router.route("/profile/update").put(isAuthenticatedUser, updateProfile);

// admin
router
  .route("/admin/user/:id")
  .put(isAuthenticatedUser, authorizeRoleAdmin, updateUserRole)
  .delete(isAuthenticatedUser, authorizeRoleAdmin, deleteUser);

module.exports = router;
