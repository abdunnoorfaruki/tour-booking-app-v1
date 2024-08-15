const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/bookingModel");
const Payment = require("../models/paymentModel");
const Tour = require("../models/tourModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  // find the tour wiht the help of toureId which is comming from request parameters
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) return next(new AppError("No tour found with this tourId", 404));

  // create checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/api/v1/bookings?tour=${
      tour.id
    }&user=${req.user._id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour._id}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: "INR",
          product_data: {
            name: tour.title,
            description: tour.description,
            images: ["https://www.natours.dev/img/tours/tour-3-cover.jpg"],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
  });

  // Now create the payment
  if (checkoutSession) {
    const newPayment = await Payment.create({
      user: req.user._id,
      transactionId: checkoutSession.id,
      amount: tour.price,
      paymentMethod: checkoutSession.payment_method_types[0],
      tour: tour._id,
    });
    // send the checkout session as response
    res.status(201).json({
      status: "success",
      message:
        "Please copy the paymentUrl and paste to the browser and make the payment",
      data: {
        data: {
          paymentUrl: checkoutSession.url,
          paymentId: newPayment._id,
        },
      },
    });
  }
});

exports.createBooking = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  //   find the payment
  const payment = await Payment.findOne({
    user,
    tour,
    paymentStatus: "pending",
  });
  if (!payment) {
    return next(
      new AppError("Please make payment befor booking the tour", 400)
    );
  }

  //   check is user already book the tour
  const isTourBooked = await Booking.findOne({
    user,
    tour,
    payment: payment._id,
  }).populate({ path: "payment", select: "paymentStatus" });
  if (isTourBooked && isTourBooked.payment.paymentStatus === "completed")
    return next(
      new AppError(
        "You have already bookd the tour, Please enjoy your tour",
        400
      )
    );

  //   Now finally book the thour
  const newToorBook = await Booking.create({
    user,
    tour,
    payment: payment._id,
    numberOfPersons: 10,
    totalAmount: parseInt(price, 10),
  });

  if (!newToorBook)
    return next(new AppError("Error to book new tour, pleasy try again", 500));

  res.status(201).json({
    status: "success",
    message: "New bookin created successfully",
    data: {
      data: newToorBook,
    },
  });
});

exports.getAllBookings = factory.getAll(Booking, [
  { path: "user", select: "name" },
  { path: "payment", select: "amount paymentMethod paymentStatus" },
  {path:"tour", select:"title location tourOwner", populate: {
    path: 'tourOwner',
    select:"name",
    model: 'User'
  }}
]);
