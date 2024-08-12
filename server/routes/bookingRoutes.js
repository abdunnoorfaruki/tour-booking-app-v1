const express = require("express");
const authController = require("../controllers/authController");
const bookingController = require("../controllers/bookingController");

const router = express.Router({ mergeParams: true });

router.use(authController.protect, authController.restrictTo("customer"));

// create checkout session
router
  .route("/checkout-session/:tourId")
  .get(bookingController.createCheckoutSession);
router
  .route("/")
  .post(bookingController.createBooking)
  .get(bookingController.getAllBookings);

module.exports = router;
