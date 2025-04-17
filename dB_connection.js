const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'jke8l.h.filess.io',
  port: 3307,
  user: 'CS315_couldfire',        
  password: '934cb898ce1347e385a99ad324ef50d1de609a59',
  database: 'CS315_couldfire'
};

async function connectToDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to the database successfully!');
    
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('Tables in database:');
    rows.forEach(row => {
      console.log(Object.values(row)[0]);
    });
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    return false;
  }
}

connectToDatabase();

module.exports = { connectToDatabase, dbConfig };
