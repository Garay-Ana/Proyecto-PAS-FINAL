const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'bn7j0bwyqvaappo6c1i3-mysql.services.clever-cloud.com',
  user: 'uxkuoqgy1dvfmnao',
  password: 'tebjKip3puV82pFVKN7U',
  database: 'bn7j0bwyqvaappo6c1i3',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
