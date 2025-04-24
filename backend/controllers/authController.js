const db = require('../db/db_connection');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.signup = (req, res) => {
  const { username, password, name, email, type } = req.body;
  
  if (!username || !password || !name || !email || !type) {
    return res.status(400).json({ msg: 'username, password, name, email and type are required' });
  }

  console.log('Signup attempt:', { username, name, email, type });

  const checkUserSql = 'SELECT * FROM LOGIN WHERE L_USERNAME = ?';
  db.query(checkUserSql, [username], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking existing user:', checkErr);
      return res.status(500).json({ msg: 'Database error checking existing user', error: checkErr.message });
    }

    if (checkResult && checkResult.length > 0) {
      return res.status(400).json({ msg: 'Username already exists' });
    }

    db.beginTransaction(err => {
      if (err) {
        console.error('Transaction start error:', err);
        return res.status(500).json({ msg: 'Transaction error', error: err.message });
      }

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

        if (type.toUpperCase() === 'ADMIN') {
          const insertAdminSql = `
            INSERT INTO ADMINS (A_ID, A_NAME, A_EMAIL)
            VALUES (?, ?, ?)
          `;
          
          db.query(insertAdminSql, [loginId, name, email], (adminErr, adminRes) => {
            if (adminErr) {
              console.error('Error inserting admin:', adminErr);
              return db.rollback(() => {
                res.status(500).json({ msg: 'Error creating admin', error: adminErr.message });
              });
            }

            console.log('Admin created with ID:', loginId);

            const linkSql = 'INSERT INTO LOGIN_ADMIN (L_ID, A_ID) VALUES (?, ?)';
            db.query(linkSql, [loginId, loginId], (linkErr) => {
              if (linkErr) {
                console.error('Error linking login/admin:', linkErr);
                return db.rollback(() => {
                  res.status(500).json({ msg: 'Error linking login/admin', error: linkErr.message });
                });
              }

              db.commit(commitErr => {
                if (commitErr) {
                  console.error('Commit error:', commitErr);
                  return db.rollback(() => {
                    res.status(500).json({ msg: 'Commit failed', error: commitErr.message });
                  });
                }

                const payload = { id: loginId, username, isAdmin: true };
                const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
                
                res.status(201).json({
                  msg: 'Admin registered successfully',
                  user: { id: loginId, name, email, type: 'ADMIN', isAdmin: true },
                  token
                });
              });
            });
          });
        } else {
          const insertUserSql = `
            INSERT INTO USERS (U_NAME, U_MAIL, U_TYPE)
            VALUES (?, ?, ?)
          `;
          
          db.query(insertUserSql, [name, email, type.toUpperCase()], (userErr, userRes) => {
            if (userErr) {
              console.error('Error inserting user:', userErr);
              return db.rollback(() => {
                res.status(500).json({ msg: 'Error creating user', error: userErr.message });
              });
            }

            const userId = userRes.insertId;
            console.log('User created with ID:', userId);

            const linkSql = 'INSERT INTO LOGIN_USER (L_ID, U_ID) VALUES (?, ?)';
            db.query(linkSql, [loginId, userId], (linkErr) => {
              if (linkErr) {
                console.error('Error linking login/user:', linkErr);
                return db.rollback(() => {
                  res.status(500).json({ msg: 'Error linking login/user', error: linkErr.message });
                });
              }

              console.log('Login-User link created successfully');

              db.commit(commitErr => {
                if (commitErr) {
                  console.error('Commit error:', commitErr);
                  return db.rollback(() => {
                    res.status(500).json({ msg: 'Commit failed', error: commitErr.message });
                  });
                }

                console.log('Transaction committed successfully');

                const payload = { id: loginId, username, isAdmin: false };
                const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
                
                res.status(201).json({
                  msg: 'User registered successfully',
                  user: { id: userId, name, email, type: type.toUpperCase(), isAdmin: false },
                  token
                });
              });
            });
          });
        }
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

  const adminSql = `
    SELECT l.L_ID, l.L_USERNAME, l.L_PASSWORD, a.A_ID, a.A_NAME, a.A_EMAIL
    FROM LOGIN l
    JOIN LOGIN_ADMIN la ON l.L_ID = la.L_ID
    JOIN ADMINS a ON la.A_ID = a.A_ID
    WHERE l.L_USERNAME = ?
  `;

  db.query(adminSql, [username], (adminErr, adminResults) => {
    if (adminErr) {
      console.error('Admin login database error:', adminErr);
      return res.status(500).json({ msg: 'Database error', error: adminErr.message });
    }

    if (adminResults && adminResults.length > 0) {
      const admin = adminResults[0];

      if (password !== admin.L_PASSWORD) {
        console.log('Invalid admin credentials - password mismatch');
        return res.status(401).json({ msg: 'Invalid credentials' });
      }

      console.log('Admin login successful for:', username);

      const payload = { 
        id: admin.L_ID, 
        username: admin.L_USERNAME,
        isAdmin: true
      };
      
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      return res.json({
        msg: 'Admin login successful',
        token,
        user: {
          id: admin.A_ID,
          name: admin.A_NAME,
          email: admin.A_EMAIL,
          type: 'ADMIN',
          isAdmin: true
        }
      });
    } else {
      const userSql = `
        SELECT l.L_ID, l.L_USERNAME, l.L_PASSWORD, u.U_ID, u.U_NAME, u.U_MAIL, u.U_TYPE
        FROM LOGIN l
        JOIN LOGIN_USER lu ON l.L_ID = lu.L_ID
        JOIN USERS u ON lu.U_ID = u.U_ID
        WHERE l.L_USERNAME = ?
      `;

      db.query(userSql, [username], (userErr, userResults) => {
        if (userErr) {
          console.error('User login database error:', userErr);
          return res.status(500).json({ msg: 'Database error', error: userErr.message });
        }

        if (userResults.length === 0) {
          console.log('Invalid credentials - user not found');
          return res.status(401).json({ msg: 'Invalid credentials' });
        }

        const user = userResults[0];

        if (password !== user.L_PASSWORD) {
          console.log('Invalid credentials - password mismatch');
          return res.status(401).json({ msg: 'Invalid credentials' });
        }

        console.log('Login successful for user:', username);

        const payload = { 
          id: user.L_ID, 
          username: user.L_USERNAME,
          isAdmin: false
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
          msg: 'Login successful',
          token,
          user: {
            id: user.U_ID,
            name: user.U_NAME,
            email: user.U_MAIL,
            type: user.U_TYPE,
            isAdmin: false
          }
        });
      });
    }
  });
};
