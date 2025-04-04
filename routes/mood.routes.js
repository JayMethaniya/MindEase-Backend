const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const moodController = require('../controllers/mood.controller');
const authMiddleware = require('../middleware/user.middleware'); // Ensure user is authenticated
const Mood = require('../model/mood.model');

// POST route to add a mood
router.post(
    '/',
    authMiddleware.authUser, // Ensure the user is authenticated
    [
        body('mood').notEmpty().withMessage('Mood is required'),
        body('note').optional().isString().withMessage('Note must be a string'),
    ],
    async (req, res) => {
        const newMood = new Mood({ userId: req.userId, mood: req.body.mood, note: req.body.note }); // Use req.userId
        await newMood.save();
        res.status(201).json(newMood);
    }
);

// GET route to retrieve moods for a user
router.get('/:userId', authMiddleware.authUser, moodController.getMoods);

module.exports = router;