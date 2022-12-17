const User = require("../models/auth.model");
const axios = require("axios");
const Stories = require("../models/stories.model");
const Otp = require("../models/otpModel");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const otpGenerator = require("otp-generator");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHander = require("../utils/errorhander");
const createToken = require("../utils/jwtToken");
const cloudinary = require("cloudinary");

// SignUp & OTP REQUEST
exports.signUp = catchAsyncErrors(async (req, res, next) => {
  if (!req.body.number) {
    return next(new ErrorHander("Please provide a mobile number.", 400));
  }

  const user = await User.findOne({
    number: req.body.number,
  }).select("+password");

  if (user) {
    return next(new ErrorHander("This mobile num is already used!", 400));
  }

  const OTP = otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  const number = req.body.number;
  const password = req.body.password;
  const student_id = req.body.student_id;

  // sending sms
  const greenwebsms = new URLSearchParams();
  greenwebsms.append("token", process.env.GREEN_WEB_SMS_TOKEN);
  greenwebsms.append("to", `+88${number}`);
  greenwebsms.append(
    "message",
    `হ্যালো! ${req.body.firstName} ${req.body.lastName} (${student_id}). চুয়েট অ্যালুমনাই এ নিবন্ধনের জন্য আপনার ওটিপি (OTP) কোড: ${OTP}`
  );
  axios
    .post(process.env.GREEN_WEB_SMS_LINK, greenwebsms)
    .then((response) => {});

  const otp = new Otp({ number, password, student_id, otp: OTP });
  const salt = await bcrypt.genSalt(10);
  otp.otp = await bcrypt.hash(otp.otp, salt);
  const result = await otp.save();
  return res.status(200).send("Otp send successfully.");
});

// SignUp & Verify OTP
exports.verifyOtp = catchAsyncErrors(async (req, res, next) => {
  const otpHolder = await Otp.find({
    number: req.body.number,
  });
  if (otpHolder.length === 0) {
    return res.status(400).send("Your otp is expired. Please try again.");
  }
  const rightOtpFind = otpHolder[otpHolder.length - 1];
  const validUser = await bcrypt.compare(req.body.otp, rightOtpFind.otp);

  if (rightOtpFind.number === req.body.number && validUser) {
    const userSet = new User(
      _.pick(req.body, [
        "number",
        "password",
        "firstName",
        "lastName",
        "student_id",
      ])
    );
    const user = await userSet.save();

    const OTPDelete = await Otp.deleteMany({
      number: rightOtpFind.number,
    });

    const token = createToken(user, "15d");
    return res.status(201).json({
      token,
    });
  } else {
    return res.status(400).send("Your OTP was wrong.");
  }
});

// SignIn
exports.signinController = catchAsyncErrors(async (req, res, next) => {
  const { number, password } = req.body;

  if (!number) {
    return next(new ErrorHander("Mobile Number is Required.", 400));
  }
  if (!password) {
    return next(new ErrorHander("Password is Required.", 400));
  }

  const user = await User.findOne({
    number: req.body.number,
  }).select("+password");

  if (!user) {
    return next(new ErrorHander("Invalid mobile number or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Invalid mobile number or password", 401));
  }

  const token = createToken(user, "15d");

  return res.status(200).json({
    token,
  });
});

// update User Profile (auth)
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = req.body;

  // If user sent a new avatar file
  if (req.files !== null && req.files.avatar !== undefined) {
    const user = await User.findById(req.user._id);
    // update when the avatar create by default mongo schema
    if (user.avatar.public_id) {
      const imageId = user.avatar.public_id;

      if (req.files.avatar.public_id !== "") {
        await cloudinary.v2.uploader.destroy(imageId);
      }

      var myCloud = await cloudinary.v2.uploader.upload(
        req.files.avatar.tempFilePath,
        {
          folder: "avatars",
        }
      );
    } else {
      // update when the avatar link already present in cloudinary
      var myCloud = await cloudinary.v2.uploader.upload(
        req.files.avatar.tempFilePath,
        {
          folder: "avatars",
        }
      );
    }

    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };

    // for update story avatar
    if (req.body.avatar.url !== "") {
      let story = await Stories.find({ userId: req.user._id });
      if (story) {
        const isUpdate = await Stories.updateMany(
          { userId: req.user._id },
          { userImg: req.body.avatar.url },
          {
            new: true,
            runValidators: true,
            useFindAndModify: false,
          }
        );
      }
    }
  }

  // If user does not sent a new avatar file
  if (req.files === null) {
    const user = await User.findById(req.user._id);
    newUserData.avatar = {
      public_id: user.avatar.public_id,
      url: user.avatar.url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  const token = createToken(user, "15d");

  res.status(200).json({
    success: true,
    token,
  });
});

// Get all users (no auth)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find().sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    users,
  });
});

// Get new 3 users (no auth)
exports.getNew3User = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({ role: "alumni" })
    .sort({
      createdAt: -1,
    })
    .limit(3);
  res.status(200).json({
    success: true,
    users,
  });
});

// Get single user (no auth)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Get single user by studentID (no auth)
exports.getSingleUserByStudentID = catchAsyncErrors(async (req, res, next) => {
  const user = await User.find({ student_id: req.params.id, role: "alumni" });

  if (!user) {
    return next(
      new ErrorHander(`${req.params.id} have not account on this site yet.`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// update User Role -- Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, number } = req.body;
  const newUserData = {
    number: req.body.number,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  // sending sms
  const greenwebsms = new URLSearchParams();
  greenwebsms.append("token", process.env.GREEN_WEB_SMS_TOKEN);
  greenwebsms.append("to", `+88${number}`);
  greenwebsms.append(
    "message",
    `Congratulation!! ${
      firstName + " " + lastName
    }, আপনাকে চুয়েট ইটিই অ্যালুমনাই এ Approve দেওয়া হয়েছে। বর্তমানে ওয়েবসাইটে login করা থাকলে logout করে পুনরায় login করুন।`
  );

  axios
    .post(process.env.GREEN_WEB_SMS_LINK, greenwebsms)
    .then((response) => {});

  res.status(200).json({
    success: true,
  });
});

// Delete User --Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

  await user.remove();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
