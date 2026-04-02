import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import axios from "axios";

dotenv.config();

// Setting up the connection to the database
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // AIVEN
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

// Letting Vite frontend talk to this backend without issues
const allowedOrigins = [
  "http://localhost:5173", 
  "https://final-year-frontend-e5gb.onrender.com"
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Check to see if the server is actually alive
app.get("/", (req, res) => {
  res.send("Node backend is running!");
});

// Making sure the code can talk to the MySQL database
app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1");
    res.json({ message: "Database connection successful!", success: true });
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({ message: "Database connection failed.", error: error.message, success: false });
  }
});

// Handling new user signups and hashing their passwords
app.post("/api/register", async (req, res) => {
  try {
    const { first_name, last_name, date_of_birth, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (first_name, last_name, date_of_birth, email, password) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [first_name, last_name, date_of_birth, email, hashedPassword]);
    res.status(201).json({ message: "User created!", userId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Checking credentials so users can log in
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(401).json({ message: "Invalid credentials" });
    
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // UPDATE: I'm sending back the last_name now so the settings page has it!
    res.status(200).json({
      user: { 
        id: user.id, 
        first_name: user.first_name, 
        last_name: user.last_name, 
        email: user.email 
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Route to update First Name, Last Name, and Email
app.put("/api/user/update-profile", async (req, res) => {
  try {
    const { id, first_name, last_name, email } = req.body;
    const sql = "UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?";
    await pool.query(sql, [first_name, last_name, email, id]);
    
    res.status(200).json({ message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile." });
  }
});

// Route to change password securely
app.put("/api/user/change-password", async (req, res) => {
  try {
    const { id, currentPassword, newPassword } = req.body;

    // 1. Get the current hashed password from DB
    const [users] = await pool.query("SELECT password FROM users WHERE id = ?", [id]);
    if (users.length === 0) return res.status(404).json({ message: "User not found" });

    const user = users[0];

    // 2. Compare the "currentPassword" typed by the user with the hash in DB
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password." });
    }

    // 3. Hash the new password and save it
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const sql = "UPDATE users SET password = ? WHERE id = ?";
    await pool.query(sql, [hashedNewPassword, id]);

    res.status(200).json({ message: "Password updated!" });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ error: "Failed to change password." });
  }
});


// Grabbing active stocks only (hiding items that have a deleted_at date)
app.get("/api/portfolio/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [assets] = await pool.query("SELECT * FROM assets WHERE user_id = ? AND deleted_at IS NULL", [userId]);

    const portfolioWithPrices = await Promise.all(assets.map(async (asset) => {
      try {
        const symbol = asset.symbol.toUpperCase();
        const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
          params: { symbol: symbol, token: process.env.FINNHUB_API_KEY }
        });
        const currentPrice = response.data.c || 0;
        return {
          ...asset,
          current_price: currentPrice,
          total_value: (currentPrice * asset.quantity).toFixed(2),
          gain_loss: ((currentPrice - asset.purchase_price) * asset.quantity).toFixed(2)
        };
      } catch (err) {
        return { ...asset, current_price: 0, total_value: 0, gain_loss: 0 };
      }
    }));
    res.json(portfolioWithPrices);
  } catch (error) {
    res.status(500).json({ message: "Error updating portfolio data." });
  }
});

// Grabbing the trade history
app.get("/api/portfolio/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [history] = await pool.query(
      "SELECT * FROM assets WHERE user_id = ? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC", 
      [userId]
    );
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history." });
  }
});

// Adding a new stock
app.post("/api/assets/add", async (req, res) => {
  try {
    const { user_id, symbol, quantity, purchase_price } = req.body;
    const sql = `INSERT INTO assets (user_id, symbol, quantity, purchase_price) VALUES (?, ?, ?, ?)`;
    await pool.query(sql, [user_id, symbol.toUpperCase(), quantity, purchase_price]);
    res.status(201).json({ message: "Asset added!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Moving a stock to history
app.delete("/api/assets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "UPDATE assets SET deleted_at = NOW() WHERE id = ?";
    await pool.query(sql, [id]);
    res.status(200).json({ message: "Asset moved to history successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Error removing asset" });
  }
});

// Searching for stock symbols
app.get("/api/search", async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get(`https://finnhub.io/api/v1/search`, {
      params: { q: q, token: process.env.FINNHUB_API_KEY }
    });
    res.json(response.data.result || []);
  } catch (error) {
    res.status(500).json({ message: "Error searching for stocks." });
  }
});

// Getting a single price quote
app.get("/api/quote/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
      params: { symbol: symbol.toUpperCase(), token: process.env.FINNHUB_API_KEY }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching price." });
  }
});

// server.js - Add this near your other User routes
app.delete("/api/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. First, wipe all assets belonging to this user
    await pool.query("DELETE FROM assets WHERE user_id = ?", [id]);

    // 2. Then, delete the user themselves
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Account and data deleted successfully." });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ error: "Failed to delete account." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

