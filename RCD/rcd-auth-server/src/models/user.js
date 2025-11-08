const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username must be at most 30 characters']
    },
    password: {
        type: String,
        required: true
    },
    // Role for RBAC: player, team_manager, admin
    role: {
        type: String,
        enum: ['player', 'team_manager', 'admin'],
        default: 'player'
    },
    // Team affiliation reference for convenience (optional, can be derived from team membership list)
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

userSchema.pre('save', async function(next) {
    const user = this;
    if (!user.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Compare raw password with hashed
userSchema.methods.comparePassword = function(candidate) {
    return bcrypt.compare(candidate, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
    const payload = { id: this._id };
    const secret = process.env.JWT_SECRET || 'change_this_secret_in_env';
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });
    return token;
};

// Method to find a user by username
userSchema.statics.findByUsername = function(username) {
    return this.findOne({ username });
};

// Method to find a user by email
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email });
};

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;