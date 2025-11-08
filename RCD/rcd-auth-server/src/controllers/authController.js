// filepath: /rcd-auth-server/rcd-auth-server/src/controllers/authController.js

const User = require('../models/user');

// Login user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token (assuming a method exists in the User model)
        const token = user.generateAuthToken();
        res.status(200).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username || undefined,
                role: user.role || 'player'
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Register user (defaults to minimal privileges as 'player')
exports.registerUser = async (req, res) => {
    const { email, password, username } = req.body;

    try {
        if (!username || typeof username !== 'string' || !username.trim()) {
            return res.status(400).json({ message: 'Username is required' });
        }
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const [existingEmail, existingUsername] = await Promise.all([
            User.findOne({ email }),
            User.findOne({ username })
        ]);

        if (existingEmail) {
            return res.status(400).json({ message: 'Email is already registered' });
        }
        if (existingUsername) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        const newUser = new User({ email, password, username: username.trim(), role: 'player' });
        await newUser.save();

        // Generate token
        const token = newUser.generateAuthToken();
        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role || 'player'
            }
        });
    } catch (error) {
        // Handle duplicate key errors from the DB
        if (error && error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || 'field';
            return res.status(400).json({ message: `${field} already exists` });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// Change password for authenticated user
exports.changePassword = async (req, res) => {
    try {
        const user = req.user; // from auth middleware
        if (!user) return res.status(401).json({ message: 'Unauthenticated' });
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'oldPassword and newPassword are required' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters' });
        }
        const matches = await user.comparePassword(oldPassword);
        if (!matches) {
            return res.status(401).json({ message: 'Old password incorrect' });
        }
        user.password = newPassword; // will be hashed by pre-save hook
        await user.save();
        return res.json({ message: 'Password updated' });
    } catch (err) {
        console.error('Change password error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};