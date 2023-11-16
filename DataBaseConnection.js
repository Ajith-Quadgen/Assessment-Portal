const mysql = require('mysql');
// Set up MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '@Quadgen23',
   // password: '@Renu001',
    //database: 'assessment',    
     database: 'assessment-testing-db',
    multipleStatements: true
  });

  module.exports=db