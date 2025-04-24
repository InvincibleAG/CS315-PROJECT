const express = require('express');
const router = express.Router();
const { 
  createEvent,
  getUserEvents,
  getAllEvents,
  getEventById,
  updateEventStatus,
  getEventsByStatus,
  getConfirmedEvents
} = require('../controllers/eventController');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

router.get('/confirmed', getConfirmedEvents);

router.get('/user', getUserEvents);

router.get('/', getAllEvents);

router.get('/:id', getEventById);

router.get('/status/:status', getEventsByStatus);

router.post('/', createEvent);

router.patch('/:id/status', updateEventStatus);

module.exports = router;
