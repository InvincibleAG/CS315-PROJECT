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
// Get all events for the current user
router.get('/user', getUserEvents);

// Get all events (admin only)
router.get('/', getAllEvents);

// Get a specific event
router.get('/:id', getEventById);

router.get('/status/:status', getEventsByStatus);

// Create a new event
router.post('/', createEvent);

// Update event status (admin only)
router.patch('/:id/status', updateEventStatus);

module.exports = router;
