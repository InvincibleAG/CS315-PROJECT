const db = require('../db/db_connection');

// Create a new event
exports.createEvent = (req, res) => {
  const { eventType, hallCode, dateStart, dateEnd, eventTimes } = req.body;
  const userId = req.user.id; // From JWT token

  // Validate request body
  if (!eventType || !hallCode || !dateStart || !dateEnd || !eventTimes || eventTimes.length === 0) {
    return res.status(400).json({ msg: 'Missing required fields' });
  }

  // Validate dates
  const startDate = new Date(dateStart);
  const endDate = new Date(dateEnd);
  const currentDate = new Date();

  if (startDate < currentDate) {
    return res.status(400).json({ msg: 'Start date cannot be in the past' });
  }

  if (endDate < startDate) {
    return res.status(400).json({ msg: 'End date must be after start date' });
  }

  // Start transaction
  db.beginTransaction(err => {
    if (err) {
      console.error('Transaction start error:', err);
      return res.status(500).json({ msg: 'Transaction error', error: err.message });
    }

    // 1. Insert into EVENTS table
    const eventSql = `
      INSERT INTO EVENTS (E_TYPE, E_HALL, E_STATUS, E_DATE_START, E_DATE_END)
      VALUES (?, ?, 'PENDING', ?, ?)
    `;

    db.query(eventSql, [eventType, hallCode, dateStart, dateEnd], (eventErr, eventResult) => {
      if (eventErr) {
        console.error('Error creating event:', eventErr);
        return db.rollback(() => {
          res.status(500).json({ msg: 'Error creating event', error: eventErr.message });
        });
      }

      const eventId = eventResult.insertId;

      // 2. Link user to event
      const linkUserSql = 'INSERT INTO USER_EVENT (U_ID, E_ID) VALUES (?, ?)';
      
      db.query(linkUserSql, [userId, eventId], (linkErr) => {
        if (linkErr) {
          console.error('Error linking user to event:', linkErr);
          return db.rollback(() => {
            res.status(500).json({ msg: 'Error linking user to event', error: linkErr.message });
          });
        }

        // 3. Insert event times
        const insertTimes = eventTimes.map(time => {
          return new Promise((resolve, reject) => {
            const timeSql = `
              INSERT INTO EVENT_TIME (E_ID, ET_DAY, ET_START, ET_END)
              VALUES (?, ?, ?, ?)
            `;
            
            db.query(timeSql, [eventId, time.day, time.start, time.end], (timeErr) => {
              if (timeErr) {
                console.error('Error inserting event time:', timeErr);
                reject(timeErr);
              } else {
                resolve();
              }
            });
          });
        });

        Promise.all(insertTimes)
          .then(() => {
            // Commit the transaction
            db.commit(commitErr => {
              if (commitErr) {
                console.error('Commit error:', commitErr);
                return db.rollback(() => {
                  res.status(500).json({ msg: 'Commit failed', error: commitErr.message });
                });
              }

              res.status(201).json({ 
                msg: 'Event created successfully',
                eventId,
                status: 'PENDING'
              });
            });
          })
          .catch(timeErr => {
            db.rollback(() => {
              res.status(500).json({ msg: 'Error inserting event times', error: timeErr.message });
            });
          });
      });
    });
  });
};

// Get all events for the current user
exports.getUserEvents = (req, res) => {
  const userId = req.user.id; // From JWT token

  const sql = `
    SELECT e.*, 
           GROUP_CONCAT(DISTINCT et.ET_DAY, ' ', et.ET_START, '-', et.ET_END SEPARATOR ', ') as TIME_SLOTS
    FROM EVENTS e
    JOIN USER_EVENT ue ON e.E_ID = ue.E_ID
    LEFT JOIN EVENT_TIME et ON e.E_ID = et.E_ID
    WHERE ue.U_ID = ?
    GROUP BY e.E_ID
    ORDER BY e.E_DATE_START DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user events:', err);
      return res.status(500).json({ msg: 'Database error', error: err.message });
    }

    res.json(results);
  });
};

// Get all events (admin only)
exports.getAllEvents = (req, res) => {
  // Check if user is admin
  // This is a placeholder - you'd need to implement admin check
  // based on your user roles system
  const isAdmin = req.user.isAdmin; // This should be set based on your auth system
  
  if (!isAdmin) {
    console.log('Access denied: User is not an admin');
    return res.status(403).json({ msg: 'Access denied: Admin only' });
  }

  const sql = `
    SELECT e.*, 
           u.U_NAME as REQUESTER_NAME,
           GROUP_CONCAT(DISTINCT et.ET_DAY, ' ', et.ET_START, '-', et.ET_END SEPARATOR ', ') as TIME_SLOTS
    FROM EVENTS e
    JOIN USER_EVENT ue ON e.E_ID = ue.E_ID
    JOIN USERS u ON ue.U_ID = u.U_ID
    LEFT JOIN EVENT_TIME et ON e.E_ID = et.E_ID
    GROUP BY e.E_ID, u.U_NAME
    ORDER BY e.E_DATE_START DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching all events:', err);
      return res.status(500).json({ msg: 'Database error', error: err.message });
    }

    res.json(results);
  });
};

// Get a specific event by ID
exports.getEventById = (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  // First check if user has access to this event
  const accessSql = `
    SELECT 1 FROM USER_EVENT 
    WHERE E_ID = ? AND U_ID = ?
    UNION
    SELECT 1 FROM USERS
    WHERE U_ID = ? AND U_TYPE IN ('ADMIN', 'STAFF')
  `;

  db.query(accessSql, [eventId, userId, userId], (accessErr, accessResults) => {
    if (accessErr) {
      console.error('Error checking event access:', accessErr);
      return res.status(500).json({ msg: 'Database error', error: accessErr.message });
    }

    if (accessResults.length === 0) {
      console.log('Access denied: User does not have access to this event');
      return res.status(403).json({ msg: 'Access denied to this event' });
    }

    // User has access, fetch event details
    const eventSql = `
      SELECT e.*, 
             u.U_NAME as REQUESTER_NAME,
             h.H_CAPACITY, h.H_PROJECTORS, h.H_BBOARDS, h.H_WBOARDS, h.H_EDUPAD
      FROM EVENTS e
      JOIN USER_EVENT ue ON e.E_ID = ue.E_ID
      JOIN USERS u ON ue.U_ID = u.U_ID
      JOIN HALLS h ON e.E_HALL = h.H_CODE
      WHERE e.E_ID = ?
    `;

    db.query(eventSql, [eventId], (eventErr, eventResults) => {
      if (eventErr) {
        console.error('Error fetching event:', eventErr);
        return res.status(500).json({ msg: 'Database error', error: eventErr.message });
      }

      if (eventResults.length === 0) {
        return res.status(404).json({ msg: 'Event not found' });
      }

      const event = eventResults[0];

      // Get event times
      const timesSql = `
        SELECT ET_DAY, ET_DAY_OF_WEEK, ET_START, ET_END
        FROM EVENT_TIME
        WHERE E_ID = ?
        ORDER BY ET_DAY, ET_START
      `;

      db.query(timesSql, [eventId], (timesErr, timesResults) => {
        if (timesErr) {
          console.error('Error fetching event times:', timesErr);
          return res.status(500).json({ msg: 'Database error', error: timesErr.message });
        }

        event.times = timesResults;
        res.json(event);
      });
    });
  });
};

// Update event status (admin only)
exports.updateEventStatus = (req, res) => {
    const eventId = req.params.id;
    const { status } = req.body;
    
    // Validate request body
    if (!status || !['CONFIRMED', 'PENDING', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status value' });
    }
    
    // Check if user is admin - placeholder function
    const isAdmin = req.user.isAdmin; // This should be set based on your auth system
    
    if (!isAdmin) {
      console.log('Access denied: User is not an admin');
      return res.status(403).json({ msg: 'Access denied: Admin only' });
    }
    
    const sql = 'UPDATE EVENTS SET E_STATUS = ? WHERE E_ID = ?';
    
    db.query(sql, [status, eventId], (err, result) => {
      if (err) {
        console.error('Error updating event status:', err);
        return res.status(500).json({ msg: 'Database error', error: err.message });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ msg: 'Event not found' });
      }
      
      res.json({ 
        msg: 'Event status updated successfully',
        eventId,
        status
      });
    });
  };
  

  // Add this to eventController.js
exports.getEventsByStatus = (req, res) => {
  const { status } = req.params;
  // Check if user is admin
  const isAdmin = req.user.isAdmin;
  
  if (!isAdmin) {
    console.log('Access denied: User is not an admin');
    return res.status(403).json({ msg: 'Access denied: Admin only' });
  }
  
  // Validate status
  const validStatus = ['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status.toUpperCase());
  if (!validStatus) {
    return res.status(400).json({ msg: 'Invalid status value' });
  }

  const sql = `
    SELECT e.*, 
           u.U_NAME as REQUESTER_NAME,
           GROUP_CONCAT(DISTINCT et.ET_DAY, ' ', et.ET_START, '-', et.ET_END SEPARATOR ', ') as TIME_SLOTS
    FROM EVENTS e
    JOIN USER_EVENT ue ON e.E_ID = ue.E_ID
    JOIN USERS u ON ue.U_ID = u.U_ID
    LEFT JOIN EVENT_TIME et ON e.E_ID = et.E_ID
    WHERE e.E_STATUS = ?
    GROUP BY e.E_ID, u.U_NAME
    ORDER BY e.E_DATE_START DESC
  `;

  db.query(sql, [status.toUpperCase()], (err, results) => {
    if (err) {
      console.error('Error fetching events by status:', err);
      return res.status(500).json({ msg: 'Database error', error: err.message });
    }

    res.json(results);
  });
};

// Add this to eventController.js
// Corrected getConfirmedEvents function
exports.getConfirmedEvents = (req, res) => {
  const sql = `
    SELECT e.*, 
           e.E_HALL,  /* Using E_HALL directly instead of H_NAME */
           GROUP_CONCAT(DISTINCT et.ET_DAY, ' ', et.ET_START, '-', et.ET_END SEPARATOR ', ') as TIME_SLOTS
    FROM EVENTS e
    JOIN HALLS h ON e.E_HALL = h.H_CODE
    LEFT JOIN EVENT_TIME et ON e.E_ID = et.E_ID
    WHERE e.E_STATUS = 'CONFIRMED'
    GROUP BY e.E_ID
    ORDER BY e.E_DATE_START ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching confirmed events:', err);
      return res.status(500).json({ msg: 'Database error', error: err.message });
    }

    res.json(results);
  });
};
