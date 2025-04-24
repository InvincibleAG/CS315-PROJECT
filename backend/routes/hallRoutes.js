const express = require('express');
const router = express.Router();
const { getAllHalls, getHallAvailability } = require('../controllers/hallController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getAllHalls);

router.get('/availability', getHallAvailability);

module.exports = router;
