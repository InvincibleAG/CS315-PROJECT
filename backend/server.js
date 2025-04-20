const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const hallRoutes = require('./routes/hallRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/halls', hallRoutes);

app.get('/', (req, res) => {
  res.send('Lecture Hall Booking System Backend is Running!');
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
