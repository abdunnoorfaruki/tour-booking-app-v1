const router = require("express").Router();

const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");

router
  .route("/:tourId")
  .post(authController.protect, reviewController.submitReview)
  .get(authController.protect, reviewController.getReviews);

router
  .route("/:reviewId")
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    reviewController.deleteReview
  );
module.exports = router;
