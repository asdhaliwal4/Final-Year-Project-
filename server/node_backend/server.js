import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt"; // Import bcrypt for password hashing

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

// API Routes

// Root route
app.get("/", (req, res) => {
  res.send("Node backend is running!");
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
      message: "Database connection failed.",
      error: error.message,
      success: false,
    });
  }
});

// User Registration Route with Full Validation
app.post("/api/register", async (req, res) => {
  try {
    const { first_name, last_name, date_of_birth, email, password } = req.body;

    //Server-Side Validation

    //Checks for missing fields
    if (!first_name || !last_name || !email || !password || !date_of_birth) {
      return res.status(400).json({ message: "All fields are required." });
    }

    //Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    //Age Validation (must be 18 or older)
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const birthDate = new Date(date_of_birth);

    if (birthDate > eighteenYearsAgo) {
      return res.status(400).json({ message: 'You must be at least 18 years old.' });
    }

    // end validation


    // hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // SQL query to insert a new user
    const sql = `
      INSERT INTO users (first_name, last_name, date_of_birth, email, password)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [first_name, last_name, date_of_birth, email, hashedPassword];

    // Execute the query
    const [result] = await pool.query(sql, values);

    res.status(201).json({
      message: "User created successfully!",
      userId: result.insertId,
    });
  } catch (error) {
    // Check for duplicate email error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Email already exists." });
    }
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Error registering user.",
      error: error.message,
    });
  }
});

// User Login Route
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Find the user by email
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    // Check if user exists
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = users[0];

    // Compare submitted password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    
   
    res.status(200).json({
      message: "Login successful!",
      user: {
        id: user.id,
        first_name: user.first_name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
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