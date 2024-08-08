const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const { promisify } = require("util");
const crypto = require("crypto");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError(`Provide email and password.`, 400));

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError(`Incorrect email or password. please try again!!`, 401)
    );
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.cookie && req.headers.cookie.startsWith("jwt")) {
    token = req.headers.cookie.split("=")[1];
  }
  if (!token) return next(new AppError(`You are not logged in.`, 403));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError(`User doesn't exist.`, 404));

  req.user = user;
  next();
});
exports.logout = catchAsync(async (req, res, next) => {
  // Clear the cookie by setting its expiration date in the past
  res.cookie("jwt", "", { expires: new Date(0), httpOnly: true });

  // Send a response indicating successful logout
  res.status(200).json({ message: "Logged out successfully" });
});
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Unauthorized Access. You don't have permisson to perform this action.`,
          401
        )
      );
    }
    next();
  };
};

// create reset password request
exports.resetPasswrodRequest = catchAsync(async (req, res, next) => {
  // check is user provide the email
  if (!req.body.email)
    return next(
      new AppError(
        "Email is required to create reset password reset request",
        400
      )
    );

  // First step is to validata the user
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(
      new AppError(
        "There is no user exist with this email address. Please provide the correct email"
      )
    );

  // Now generate the password rest token
  const resetToekn = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Now send the reset link to the email

  const resettUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/reset-password/${resetToekn}`;

  const message = `Reset your password? Submit a patch request with your new password and confirmPassword to ${resettUrl}. If you didn't make a request to reset your passrod then ignore this email.`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: "Your password reset token (Valid for 10 min",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Reset password link has been sent to your email",
    });
  } catch (error) {
    console.log(error);
    user.passwordResetToken = undefined;
    user.PasswordResetTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error to sending the email. Try again later")
    );
  }
});

// reset the password
exports.resetPasswrod = catchAsync(async (req, res, next) => {
  // first find the user using the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    PasswordResetTokenExpire: { $gt: Date.now() },
  });

  if(!user) return next(new AppError("Invalid token or expired"))

  user.password = req.body.password,
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined;
  user.PasswordResetTokenExpire= undefined;
  await user.save()

  // login in the user
  const token = await signToken()
  const cookieOptions = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
  res.status(200).json({
    status:"success",
    token,
    message:"Password reset successfully"
  })
});
