const mysql = require('mysql');
// Set up MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '@Quadgen23',
    database: 'assessment',

    // password: '@Renu001',
    // database: 'assessment',
    multipleStatements: true
  });

  module.exports=db