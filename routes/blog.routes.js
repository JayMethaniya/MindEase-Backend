const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const blogController = require('../controllers/blog.controller');
const authMiddleware = require('../middleware/user.middleware'); // Ensure user is authenticated
const upload = require('../middleware/upload.middleware'); // Ensure user is authenticated

router.post(
    '/add',
    authMiddleware.authUser, 
    upload.single('image'),
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('content').notEmpty().withMessage('Content is required'),
    ],
    blogController.createBlog
);
router.get(
    '/:userId',
    authMiddleware.authUser, 
    blogController.getBlogs
);
module.exports = router;