const express = require("express");
const router = express.Router();
const {
  isAuthenticatedUser,
  authorizeRoleAdmin,
} = require("../middleware/auth");

const {
  createEvent,
  updateEvent,
  deleteEvent,
  getAllevents,
  getSingleEvent,
  getNew3Event,
} = require("../controllers/events.controller");

// no auth
router.get("/events", getAllevents);
router.route("/event/:id").get(getSingleEvent);
router.get("/event/three/request", getNew3Event);

// admin
router.post(
  "/admin/create/event",
  isAuthenticatedUser,
  authorizeRoleAdmin,
  createEvent
);
router
  .route("/admin/event/:id")
  .put(isAuthenticatedUser, authorizeRoleAdmin, updateEvent)
  .delete(isAuthenticatedUser, authorizeRoleAdmin, deleteEvent);

module.exports = router;
