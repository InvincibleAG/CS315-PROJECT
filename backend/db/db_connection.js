const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'jke8l.h.filess.io',
  port: process.env.DB_PORT || 3307,
  user: process.env.DB_USER || 'CS315_couldfire',
  password: process.env.DB_PASSWORD || '934cb898ce1347e385a99ad324ef50d1de609a59',
  database: process.env.DB_NAME || 'CS315_couldfire',
});

db.connect(err => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
  } else {
    console.log('✅ Connected to remote MySQL database!');
  }
});

module.exports = db;
