const mysql = require('mysql');
// Set up MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '@Renu001',
    database: 'assessment',
    multipleStatements: true
  });

  module.exports=db