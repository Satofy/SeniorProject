const express = require('express');
const { listTeams, createTeam, requestJoin, approveRequest, listRequests, declineRequest, getTeam, deleteTeam } = require('../controllers/teamController');
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', listTeams);
router.get('/:id', getTeam);
router.post('/', auth, createTeam);
router.post('/:id/requests', auth, requestJoin);
// Legacy alias support for older frontends
router.post('/:id/join', auth, requestJoin);
router.post('/:id/requests/:reqId/approve', auth, approveRequest);
router.get('/:id/requests', auth, listRequests);
router.post('/:id/requests/:reqId/decline', auth, declineRequest);
router.delete('/:id', auth, requireRole('admin'), deleteTeam);

module.exports = router;
