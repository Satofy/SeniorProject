const express = require('express');
const { listUsers, changeRole, deleteUser } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', auth, requireRole('admin'), listUsers);
router.patch('/:id/role', auth, requireRole('admin'), changeRole);
router.delete('/:id', auth, requireRole('admin'), deleteUser);

module.exports = router;
