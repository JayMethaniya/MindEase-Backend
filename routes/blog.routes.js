const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const blogController = require("../controllers/blog.controller");
const authMiddleware = require("../middleware/user.middleware"); // Ensure user is authenticated
const upload = require("../middleware/upload.middleware"); // Ensure user is authenticated
const blogModel = require("../model/blog.model");

router.post(
  "/add",
  authMiddleware.authUser,
  upload.single("blogImage"),
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
  ],
  async (req, res) => {
    const newBlog = new blogModel({
      title: req.body.title,
      content: req.body.content,
      authorId: req.userId, // Use req.userId
      blogImage: req.file?.path, // Assuming you're using multer for file uploads
    });

    await newBlog.save();
    res.status(201).json(newBlog);
  }
);
router.get("/:userId", authMiddleware.authUser, blogController.getBlogs);

// Get recent blogs
router.get("/recent", async (req, res) => {
  try {
    const recentBlogs = await blogModel
      .find()
      .populate("authorId", "fullName")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json(recentBlogs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching recent blogs", error: error.message });
  }
});

module.exports = router;
