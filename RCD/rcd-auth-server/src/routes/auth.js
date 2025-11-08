// filepath: /rcd-auth-server/rcd-auth-server/src/routes/auth.js
const express = require('express');
const { loginUser, registerUser, changePassword } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Route for user login
router.post('/login', loginUser);

// Route for user registration
router.post('/register', registerUser);

// Change password (authenticated user only)
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;