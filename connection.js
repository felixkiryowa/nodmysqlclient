const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password@123",
    database: "client",
  });
  connection.connect((err) => {
    if (err) {
      console.log("Error connecting to Db");
    } else {
      console.log("Connection established");
    }
  });

  module.exports = connection;