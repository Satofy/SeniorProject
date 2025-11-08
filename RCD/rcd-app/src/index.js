const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const routes = require('./routes');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
const cors = require('cors');
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

// Database connection
connectDB();

// Routes
app.use('/api', routes);

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});