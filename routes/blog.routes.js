const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const blogController = require("../controllers/blog.controller");
const authMiddleware = require("../middleware/user.middleware");
const upload = require("../middleware/upload.middleware");

// Get all blogs
router.get("/", authMiddleware.authAdminOrUser, blogController.getBlogs);

// Create new blog
router.post(
  "/add",
  authMiddleware.authAdminOrUser,
  upload.single("blogImage"),
  [
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters long"),
    body("content")
      .notEmpty()
      .withMessage("Content is required")
      .isLength({ min: 10 })
      .withMessage("Content must be at least 10 characters long"),
  ],
  blogController.createBlog
);

// Update blog
router.put(
  "/:id",
  authMiddleware.authAdminOrUser,
  upload.single("blogImage"),
  [
    body("title")
      .optional()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters long"),
    body("content")
      .optional()
      .isLength({ min: 10 })
      .withMessage("Content must be at least 10 characters long"),
  ],
  blogController.updateBlog
);

// Delete blog
router.delete("/:id", authMiddleware.authAdminOrUser, blogController.deleteBlog);

module.exports = router;
