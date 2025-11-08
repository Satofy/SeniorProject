const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const tournamentsRoutes = require('./routes/tournaments');
const teamsRoutes = require('./routes/teams');
const usersRoutes = require('./routes/users');
const authMiddleware = require('./middleware/authMiddleware');
const User = require('./models/user');
let MongoMemoryServer;
try {
  // optional dependency for dev without local Mongo
  ({ MongoMemoryServer } = require('mongodb-memory-server'));
} catch (_) {}

dotenv.config();

async function ensureDefaultAdmin() {
  if (!process.env.AUTO_CREATE_ADMIN || process.env.AUTO_CREATE_ADMIN !== 'true') return;
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const existing = await User.findOne({ email });
  if (!existing) {
    const u = new User({ email, password, role: 'admin', username: 'admin' });
    await u.save();
    console.log(`[seed] Created default admin: ${email}`);
  } else {
    console.log(`[seed] Admin already exists: ${email}`);
  }
}

async function start() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static('public'));

  // Enable CORS for local/frontend dev (must be before routes)
  const originsFromEnv = process.env.FRONTEND_ORIGIN || 'http://localhost:3000,http://localhost:3001';
  const allowedOrigins = originsFromEnv
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
          return callback(null, true);
        }
      }
      console.warn(`[cors] Blocked origin ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    }
  }));

  // Database connection (support in-memory for dev)
  const useMemory = process.env.USE_MEMORY_DB === 'true';
  if (useMemory) {
    if (!MongoMemoryServer) {
      console.warn('USE_MEMORY_DB=true but mongodb-memory-server not installed. Falling back to DB_CONNECTION.');
    } else {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      process.env.DB_CONNECTION = uri;
      console.log(`[db] Using in-memory MongoDB at ${uri}`);
    }
  }

  const connStr = process.env.DB_CONNECTION || process.env.MONGO_URI;
  if (!connStr) {
    console.warn('DB_CONNECTION/MONGO_URI not set. Set one in .env or enable USE_MEMORY_DB=true for in-memory dev database.');
  }
  try {
    await mongoose.connect(connStr, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Database connected');
  } catch (err) {
    console.error('Database connection error:', err);
  }

  // Seed default admin if configured
  try {
    await ensureDefaultAdmin();
  } catch (e) {
    console.error('Error ensuring default admin:', e);
  }

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/tournaments', tournamentsRoutes);
  app.use('/api/teams', teamsRoutes);
  app.use('/api/users', usersRoutes);

  // audit logs listing (admin only)
  const requireRole = require('./middleware/roleMiddleware');
  const AuditLog = require('./models/auditLog');
  app.get('/api/audit-logs', authMiddleware, requireRole('admin'), async (req, res) => {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(200);
    res.json(logs.map(l => ({
      timestamp: l.timestamp,
      user: l.user,
      action: l.action,
      details: l.details,
    })));
  });

  // Lightweight endpoint for frontend to fetch the current authenticated user
  app.get('/api/auth/me', authMiddleware, (req, res) => {
    // authMiddleware attaches `req.user`
    const user = req.user;
    // Only expose safe fields
    res.json({ id: user._id, email: user.email, username: user.username || undefined, role: user.role || 'player' });
  });

  // Start server
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start();