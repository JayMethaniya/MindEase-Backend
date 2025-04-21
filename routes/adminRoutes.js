const express = require('express');
const router = express.Router();
const { adminLogin } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Admin login route
router.post('/login', adminLogin);

// Protected route example
router.get('/profile', authMiddleware, (req, res) => {
    res.json({ message: 'Protected route accessed', admin: req.admin });
});

module.exports = router; 