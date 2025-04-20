import mysql from 'mysql2/promise';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dbConfig = {
  host:     'jke8l.h.filess.io',
  port:     3307,
  user:     'CS315_couldfire',
  password: '934cb898ce1347e385a99ad324ef50d1de609a59',
  database: 'CS315_couldfire',
};

async function executeSqlFile(filePath) {
  let connection;
  try {
    const sqlContent = await fs.readFile(filePath, 'utf8');
    const queries = sqlContent
      .split(';')
      .map(q => q.trim())
      .filter(Boolean);

    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully!');

    for (const query of queries) {
      console.log(`▶️  Executing: ${query.substring(0,50)}...`);
      await connection.query(query);
    }

    console.log('🎉 SQL file executed successfully!');

    const [rows] = await connection.query('SELECT * FROM LOGIN LIMIT 5');
    console.table(rows);

  } catch (err) {
    console.error('❌ Error executing SQL file:', err);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Database connection closed');
    }
  }
}

// Path conversion for Windows compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlFilePath = path.join(__dirname, 'LHC.sql');

await executeSqlFile(sqlFilePath);
