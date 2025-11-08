const express = require('express');
const authRoutes = require('./auth');

const router = express.Router();

// Main route for the application
router.get('/', (req, res) => {
    res.send('Welcome to the RCD App!');
});

// Use authentication routes
router.use('/auth', authRoutes);

module.exports = router;