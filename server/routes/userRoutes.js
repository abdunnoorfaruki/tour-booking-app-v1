const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const bookingRouter = require("../routes/bookingRoutes");
const router = express.Router();

// user bookings
router.use("/bookings", bookingRouter);

router.route("/").get(authController.protect, userController.getAllUsers);
router.route("/profile").patch(
  authController.protect,

  userController.uploadUserPhoto,

  userController.updateMe,
  userController.updateUser
);

module.exports = router;
