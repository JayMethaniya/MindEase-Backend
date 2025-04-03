const express = require("express");
const { body } = require("express-validator");
const multer = require("../config/multerConfig");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/user.middleware");

const router = express.Router();

router.post(
  "/signup",
  multer.fields([
    { name: "idProof", maxCount: 1 }, // Expecting 1 file for idProof
    { name: "profilePhoto", maxCount: 1 } // Expecting 1 file for profilePhoto
  ]),
  [
    body("fullName").isLength({ min: 3 }).withMessage("Full name should be at least 3 characters"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password should be at least 6 characters"),
  ],
  userController.registerUser
);

router.post("/login", userController.loginUser);
router.get("/profile", authMiddleware.authUser, userController.getProfile);

module.exports = router;
