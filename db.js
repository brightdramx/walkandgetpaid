const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Mwakalinga2680###',
  database: 'DBCD_WALK'
});

connection.connect((err) => {
  if (err) {
    console.error('MySQL Connection Error:', err);
    return;
  }
  console.log('✅ Connected to MySQL Database!');
});

module.exports = connection;
