const express = require("express");
const morgan = require("morgan");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cloudinary = require("cloudinary");
const fileUpload = require("express-fileupload");

const errorMiddleware = require("./middleware/error");

// Config dotev
require("dotenv").config({
  path: ".env",
});

const app = express();
app.use(cors());

// Connect to database
connectDB();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

// Cloudinary for file upload
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Load routes
const authRouter = require("./routes/auth.route");
const eventRouter = require("./routes/events.route");
const storyRouter = require("./routes/stories.route");
const chatRouter = require("./routes/ChatRoute");
const messageRouter = require("./routes/MessageRoute");

// Dev Logginf Middleware
app.use(morgan("dev"));

// Use Routes
app.use("/api", authRouter);
app.use("/api", eventRouter);
app.use("/api", storyRouter);
app.use("/api", chatRouter);
app.use("/api", messageRouter);
app.use("/", (req, res) => {
  res.json({ msg: "It is running successfully." });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    msg: "Page not founded",
  });
});

// Middleware for Errors
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`App is running`);
});
