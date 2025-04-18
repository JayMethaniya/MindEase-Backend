const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../controllers/contact.controller');

router.post('/send', sendContactEmail);

module.exports = router; 