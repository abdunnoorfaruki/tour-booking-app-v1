const express = require("express");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const path = require("path");

const userRouter = require("./routes/userRoutes");
const authRouter = require("./routes/authRoutes");
const adminRouter = require("./routes/adminRoutes");

const app = express();

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Tasks:

// ROUTES
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);

// END
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 400));
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
