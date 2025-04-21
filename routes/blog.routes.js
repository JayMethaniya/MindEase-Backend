const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const blogController = require("../controllers/blog.controller");
const authMiddleware = require("../middleware/user.middleware");
const upload = require("../middleware/upload.middleware");

// Get all blogs
router.get("/", authMiddleware.authUser, blogController.getBlogs);

// Create new blog
router.post(
  "/add",
  authMiddleware.authUser,
  upload.single("blogImage"),
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
  ],
  blogController.createBlog
);

// Update blog
router.put("/:id", authMiddleware.authUser, blogController.updateBlog);

// Delete blog
router.delete("/:id", authMiddleware.authUser, blogController.deleteBlog);

module.exports = router;
