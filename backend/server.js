const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000; 

app.use(cors());
app.use(express.json());

const authRoutes = require(path.join(__dirname, 'routes', 'authRoutes'));
const eventRoutes = require(path.join(__dirname, 'routes', 'eventRoutes'));
const hallRoutes = require(path.join(__dirname, 'routes', 'hallRoutes'));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/halls', hallRoutes);

app.get('/', (req, res) => {
  res.send('Lecture Hall Booking System Backend is Running!');
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Try another port.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});
