const express = require("express");
const { body } = require("express-validator");
const upload = require('../middleware/upload.middleware');

const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/user.middleware");

const router = express.Router();

router.post('/signup', upload.fields([
  { name: 'idProof', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 }
]),
  [
    body("fullName").isLength({ min: 3 }).withMessage("Full name should be at least 3 characters"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password should be at least 6 characters"),
  ],
  userController.registerUser
);

router.post("/login", userController.loginUser);
router.get("/profile/:id", authMiddleware.authUser, userController.getProfile); 
router.put("/profile/:id", authMiddleware.authUser, upload.single("profilePhoto"), userController.updateProfile);
router.get("/doctors", authMiddleware.authUser, userController.getDoctors);



module.exports = router;
