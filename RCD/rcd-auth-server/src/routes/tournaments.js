const express = require('express');
const { listTournaments, createTournament, register, updateTournament, deleteTournament } = require('../controllers/tournamentController');
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', listTournaments);
router.post('/', auth, requireRole('admin'), createTournament);
router.post('/:id/register', auth, register);
router.patch('/:id', auth, requireRole('admin'), updateTournament);
router.delete('/:id', auth, requireRole('admin'), deleteTournament);

module.exports = router;
