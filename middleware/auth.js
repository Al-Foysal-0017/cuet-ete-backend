const jwt = require("jsonwebtoken");
const User = require("../models/auth.model");
const ErrorHandler = require("../utils/errorhander");

exports.isAuthenticatedUser = async (req, res, next) => {
  const authHeaders = req.headers.authorization;

  const token = authHeaders?.split("Bearer ")[1];
  try {
    const { user } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(user._id);
    next();
  } catch (error) {
    return res.status(401).json({ errors: [{ msg: error.message }] });
  }
};

exports.authorizeRoleAdmin = async (req, res, next) => {
  const authHeaders = req.headers.authorization;
  const token = authHeaders?.split("Bearer ")[1];
  try {
    const { user } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(user._id);
    if (req.user.role !== "admin") {
      return next(
        new ErrorHandler(
          `User type: ${req.user.role} is not allowed to access this resouce `,
          403
        )
      );
    }
    next();
  } catch (error) {
    return res.status(401).json({ errors: [{ msg: error.message }] });
  }
};
