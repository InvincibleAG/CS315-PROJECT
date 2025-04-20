const db = require('../db/db_connection');

// Get all halls
exports.getAllHalls = (req, res) => {
  const sql = 'SELECT * FROM HALLS ORDER BY H_CODE';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching halls:', err);
      return res.status(500).json({ msg: 'Database error', error: err.message });
    }
    
    res.json(results);
  });
};

// Get hall availability for a date range
exports.getHallAvailability = (req, res) => {
  const { hallCode, dateStart, dateEnd } = req.query;
  
  if (!hallCode || !dateStart || !dateEnd) {
    return res.status(400).json({ msg: 'hallCode, dateStart, and dateEnd are required' });
  }
  
  // Get all time slots for this hall during the specified date range
  const sql = `
    SELECT 
      e.E_ID, e.E_TYPE, e.E_STATUS, e.E_DATE_START, e.E_DATE_END,
      et.ET_DAY, et.ET_DAY_OF_WEEK, et.ET_START, et.ET_END
    FROM EVENTS e
    JOIN EVENT_TIME et ON e.E_ID = et.E_ID
    WHERE e.E_HALL = ?
      AND e.E_STATUS != 'CANCELLED'
      AND (
        (e.E_DATE_START <= ? AND e.E_DATE_END >= ?)
        OR (e.E_DATE_START <= ? AND e.E_DATE_END >= ?)
        OR (e.E_DATE_START >= ? AND e.E_DATE_END <= ?)
      )
    ORDER BY et.ET_DAY, et.ET_START
  `;
  
  db.query(sql, [
    hallCode, 
    dateEnd, dateStart,  // Condition 1
    dateStart, dateStart, // Condition 2
    dateStart, dateEnd   // Condition 3
  ], (err, results) => {
    if (err) {
      console.error('Error checking hall availability:', err);
      return res.status(500).json({ msg: 'Database error', error: err.message });
    }
    
    res.json({
      hallCode,
      dateRange: { start: dateStart, end: dateEnd },
      bookedSlots: results
    });
  });
};