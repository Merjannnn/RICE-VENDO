/**
 * MySQL Database Connection Configuration
 * Establishes connection pool for the Rice Vending System
 */

const mysql = require("mysql2/promise");
require("dotenv").config();

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
  keepAliveInitialDelayMs: 0,
});

// Test connection
pool
  .getConnection()
  .then((connection) => {
    console.log("✓ MySQL Database connected successfully");
    connection.release();
  })
  .catch((err) => {
    console.error("✗ Failed to connect to MySQL:", err.message);
    process.exit(1);
  });

module.exports = pool;
