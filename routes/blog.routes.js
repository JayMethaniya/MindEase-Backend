const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const blogController = require('../controllers/blog.controller');
const authMiddleware = require('../middleware/user.middleware'); // Ensure user is authenticated
const upload = require('../middleware/upload.middleware'); // Ensure user is authenticated
const blogModel = require('../model/blog.model');

router.post(
    '/add',
    authMiddleware.authUser, 
    upload.single('image'),
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('content').notEmpty().withMessage('Content is required'),
    ],
    async (req, res) => {
        const newBlog = new blogModel({
            title: req.body.title,
            content: req.body.content,
            authorId: req.userId, // Use req.userId
            blogImage: req.file?.path // Assuming you're using multer for file uploads
        });

        await newBlog.save();
        res.status(201).json(newBlog);
    }
);
router.get(
    '/:userId',
    authMiddleware.authUser, 
    blogController.getBlogs
);
module.exports = router;