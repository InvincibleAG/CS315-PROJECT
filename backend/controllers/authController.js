const db = require('../db/db_connection');
const jwt = require('jsonwebtoken');
// Removed bcrypt import
require('dotenv').config();

exports.signup = (req, res) => {
  const { username, password, name, email, type } = req.body;
  
  // Validate request body
  if (!username || !password || !name || !email || !type) {
    return res.status(400).json({ msg: 'username, password, name, email and type are required' });
  }

  // Log for debugging
  console.log('Signup attempt:', { username, name, email, type });

  // Check if user already exists
  const checkUserSql = 'SELECT * FROM LOGIN WHERE L_USERNAME = ?';
  db.query(checkUserSql, [username], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking existing user:', checkErr);
      return res.status(500).json({ msg: 'Database error checking existing user', error: checkErr.message });
    }

    if (checkResult && checkResult.length > 0) {
      return res.status(400).json({ msg: 'Username already exists' });
    }

    // Start transaction
    db.beginTransaction(err => {
      if (err) {
        console.error('Transaction start error:', err);
        return res.status(500).json({ msg: 'Transaction error', error: err.message });
      }

      // 1) Insert into LOGIN - now using plain password
      const insertLoginSql = 'INSERT INTO LOGIN (L_USERNAME, L_PASSWORD) VALUES (?, ?)';
      db.query(insertLoginSql, [username, password], (loginErr, loginRes) => {
        if (loginErr) {
          console.error('Error inserting login:', loginErr);
          return db.rollback(() => {
            res.status(500).json({ msg: 'Error creating login', error: loginErr.message });
          });
        }

        const loginId = loginRes.insertId;
        console.log('Login created with ID:', loginId);

        // 2) Insert into USERS
        const insertUserSql = `
          INSERT INTO USERS (U_NAME, U_MAIL, U_TYPE)
          VALUES (?, ?, ?)
        `;
        
        db.query(insertUserSql, [name, email, type], (userErr, userRes) => {
          if (userErr) {
            console.error('Error inserting user:', userErr);
            return db.rollback(() => {
              res.status(500).json({ msg: 'Error creating user', error: userErr.message });
            });
          }

          const userId = userRes.insertId;
          console.log('User created with ID:', userId);

          // 3) Link in LOGIN_USER
          const linkSql = 'INSERT INTO LOGIN_USER (L_ID, U_ID) VALUES (?, ?)';
          db.query(linkSql, [loginId, userId], (linkErr) => {
            if (linkErr) {
              console.error('Error linking login/user:', linkErr);
              return db.rollback(() => {
                res.status(500).json({ msg: 'Error linking login/user', error: linkErr.message });
              });
            }

            console.log('Login-User link created successfully');

            // 4) Commit the transaction
            db.commit(commitErr => {
              if (commitErr) {
                console.error('Commit error:', commitErr);
                return db.rollback(() => {
                  res.status(500).json({ msg: 'Commit failed', error: commitErr.message });
                });
              }

              console.log('Transaction committed successfully');

              // Generate JWT token
              const payload = { id: loginId, username };
              const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
              
              // Send success response
              res.status(201).json({
                msg: 'User registered successfully',
                user: { id: userId, name, email, type },
                token
              });
            });
          });
        });
      });
    });
  });
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ msg: 'Username and password are required' });
  }

  console.log('Login attempt for username:', username);

  // 1. Get user login details
  const sql = `
    SELECT l.L_ID, l.L_USERNAME, l.L_PASSWORD, u.U_ID, u.U_NAME, u.U_MAIL, u.U_TYPE
    FROM LOGIN l
    JOIN LOGIN_USER lu ON l.L_ID = lu.L_ID
    JOIN USERS u ON lu.U_ID = u.U_ID
    WHERE l.L_USERNAME = ?
  `;

  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Login database error:', err);
      return res.status(500).json({ msg: 'Database error', error: err.message });
    }

    if (results.length === 0) {
      console.log('Invalid credentials - user not found');
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const user = results[0];

    // 2. Compare password - now using direct comparison
    if (password !== user.L_PASSWORD) {
      console.log('Invalid credentials - password mismatch');
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    console.log('Login successful for user:', username);

    // 3. Generate JWT token
    const payload = { 
      id: user.L_ID, 
      username: user.L_USERNAME 
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 4. Return token and user info
    res.json({
      msg: 'Login successful',
      token,
      user: {
        id: user.U_ID,
        name: user.U_NAME,
        email: user.U_MAIL,
        type: user.U_TYPE
      }
    });
  });
};
