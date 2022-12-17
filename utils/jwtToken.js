const jwt = require("jsonwebtoken");

const createToken = (user, expires) => {
  return jwt.sign({ user }, process.env.JWT_SECRET, {
    expiresIn: expires,
  });
};

module.exports = createToken;
