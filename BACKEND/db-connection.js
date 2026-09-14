/**
 * MySQL Database Connection Configuration
 * Establishes connection pool for the Rice Vending System
 */

const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "bigasan_rice_vending",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

pool.dbConnected = false;

// Check the database connection without crashing the app if MySQL is not running.
pool
  .getConnection()
  .then((connection) => {
    pool.dbConnected = true;
    console.log("✓ MySQL Database connected successfully");
    connection.release();
  })
  .catch((err) => {
    pool.dbConnected = false;
    console.warn(
      "⚠ MySQL is not available. The server will continue in degraded mode.",
    );
    console.warn(`   ${err.message}`);
  });

module.exports = pool;
