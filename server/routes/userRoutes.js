const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router.route("/").get(authController.protect, userController.getAllUsers);
router
  .route("/profile")
  .patch(
    authController.protect,

    userController.uploadUserPhoto,

    userController.updateMe,
    userController.updateUser
  );

module.exports = router;
