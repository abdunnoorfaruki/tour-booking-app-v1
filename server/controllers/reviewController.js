const handleFactory = require("../controllers/handlerFactory");
const Review = require("../models/reviewModel");
const Tour = require("../models/tourModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
exports.submitReview = catchAsync(async (req, res, next) => {
  const tour = req.params.tourId;
  const user = req.user._id;
  const { comment, rating } = req.body;
  if (!comment || !rating)
    return next(
      new AppError("comment and raging is required to submit new review", 400)
    );

  // submit the new review
  const newReview = await Review.create({ user, tour, comment, rating });
  if (!newReview)
    return next(
      new AppError("Error to submit the review, please try again later", 500)
    );

  res.status(201).json({
    status: "success",
    message: "New review submited successfully",
    data: {
      data: newReview,
    },
  });
});

exports.getReviews = handleFactory.getAll(Review, [
  { path: "user", select: "name" },
  { path: "tour", select: "title, description price tourOwner" },
]);

exports.deleteReview = catchAsync(async (req, res, next) => {
  const user = req.user._id;
  const reviewId = req.params.reviewId;

  const isReview = await Review.findById(reviewId).populate("tour","titel price tourOwner");
  if (!isReview) return next(new AppError("No review found with this Id"));
  
  //   check is this user owner of this tour
  const isAuthorizedUser =
    user.toString() === isReview.tour.tourOwner.toString();

  if (!isAuthorizedUser)
    return next(
      new AppError(
        "You don't have permission to deleter others user's tour's review",
        401
      )
    );

  const review = await Review.findByIdAndDelete(reviewId);
  if (!review) return next(new AppError("Error to delete the review", 500));

  res.status(204).json({
    status: "success",
    message: "Review deleted successfully",
  });
});
