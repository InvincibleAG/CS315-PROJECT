const express = require('express');
const router = express.Router();
const { getAllHalls, getHallAvailability } = require('../controllers/hallController');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Get all halls
router.get('/', getAllHalls);

// Check hall availability
router.get('/availability', getHallAvailability);

module.exports = router;