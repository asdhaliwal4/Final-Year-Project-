import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise"; // Import the mysql2 library

dotenv.config();

// Database Connection 
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());



// Root route
app.get("/", (req, res) => {
  res.send("✅ Node backend is running!");
});

// Test API route to check the database connection
app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1");
    res.json({
      message: "Database connection successful!",
      success: true,
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({
      message: " Database connection failed.",
      error: error.message,
      success: false,
    });
  }
});

// Example API route to get all users from a 'users' table
app.get("/api/users", async (req, res) => {
  try {
    const [users] = await pool.query("SELECT * FROM users");
    res.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});