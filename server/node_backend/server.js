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
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(null, true); // For now, allow all during testing, or replace with logic
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

//check to see if the server is actually alive
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

    res.status(200).json({
      user: { id: user.id, first_name: user.first_name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Grabbing the user's stocks and getting fresh prices from Finnhub
app.get("/api/portfolio/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [assets] = await pool.query("SELECT * FROM assets WHERE user_id = ?", [userId]);

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

// Adding a new stock to the user's collection
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

// Dropping a stock from the portfolio
app.delete("/api/assets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "DELETE FROM assets WHERE id = ?";
    await pool.query(sql, [id]);
    res.status(200).json({ message: "Asset removed successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Error removing asset" });
  }
});

// Searching for stock symbols via the Finnhub API
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

// Getting a single price quote for the search feature
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});