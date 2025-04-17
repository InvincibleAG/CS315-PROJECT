const mysql = require('mysql2/promise');
const fs = require('fs').promises;

// Database connection configuration
const dbConfig = {
  host: 'jke8l.h.filess.io',
  port: 3307,
  user: 'CS315_couldfire',
  password: '934cb898ce1347e385a99ad324ef50d1de609a59',
  database: 'CS315_couldfire'
};

async function executeSqlFile(filePath) {
  let connection;
  
  try {
    // Read SQL file
    const sqlContent = await fs.readFile(filePath, 'utf8');
    
    // Split by semicolon to get individual queries
    const queries = sqlContent.split(';').filter(query => query.trim());
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully!');
    
    // Execute each query
    for (const query of queries) {
      if (query.trim()) {
        console.log(`Executing query: ${query.trim().substring(0, 50)}...`);
        await connection.query(query);
      }
    }
    
    console.log('SQL file executed successfully!');
    
    // Query to verify
    const [rows] = await connection.query('SELECT * FROM dummy_products');
    console.log('Data in dummy_products table:');
    console.table(rows);
    
  } catch (error) {
    console.error('Error executing SQL file:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Save the SQL file and execute it
async function createAndRunSqlFile() {
  const fileName = 'create-dummy-table.sql';
  
  try {
    
    // Execute the SQL file
    await executeSqlFile(fileName);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createAndRunSqlFile();
