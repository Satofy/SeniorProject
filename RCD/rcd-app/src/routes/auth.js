const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login route
router.post('/login', authController.login);

// Registration route (if needed)
router.post('/register', authController.register);

// Export the router
module.exports = router;