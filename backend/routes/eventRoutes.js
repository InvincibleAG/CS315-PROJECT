const express = require('express');
const router = express.Router();
const { 
  createEvent,
  getUserEvents,
  getAllEvents,
  getEventById,
  updateEventStatus
} = require('../controllers/eventController');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Get all events for the current user
router.get('/user', getUserEvents);

// Get all events (admin only)
router.get('/', getAllEvents);

// Get a specific event
router.get('/:id', getEventById);

// Create a new event
router.post('/', createEvent);

// Update event status (admin only)
router.patch('/:id/status', updateEventStatus);

module.exports = router;