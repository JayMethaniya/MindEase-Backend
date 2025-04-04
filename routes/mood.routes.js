const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const moodController = require('../controllers/mood.controller');
const authMiddleware = require('../middleware/user.middleware'); // Ensure user is authenticated

// POST route to add a mood
router.post(
    '/',
    authMiddleware.authUser, // Ensure the user is authenticated
    [
        body('mood').notEmpty().withMessage('Mood is required'),
        body('note').optional().isString().withMessage('Note must be a string'),
    ],
    moodController.addMood
);

// GET route to retrieve moods for a user
router.get('/:userId', authMiddleware.authUser, moodController.getMoods);

module.exports = router;