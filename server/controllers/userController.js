const multer = require("multer");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/users");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

exports.getAllUsers = factory.getAll(User);
exports.updateMe = (req, res, next) => {
  req.params.id = req.user._id;
  if (req.body.role) {
    delete req.body.role;
    return next(new AppError(`You don't have permission to do that`, 400));
  }


  if (req.file) req.body.avatar = req.file.filename;


  next();
};
exports.updateUser = factory.updateOne(User);
