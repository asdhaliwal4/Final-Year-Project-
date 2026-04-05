import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import axios from "axios";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false }
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => res.send("Node backend is running!"));

// Auth Routes
app.post("/api/register", async (req, res) => {
  try {
    const { first_name, last_name, date_of_birth, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (first_name, last_name, date_of_birth, email, password) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [first_name, last_name, date_of_birth, email, hashedPassword]);
    res.status(201).json({ message: "User created!", userId: result.insertId });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(401).json({ message: "Invalid credentials" });
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
    res.status(200).json({ user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Profile Update Routes
app.put("/api/user/update-profile", async (req, res) => {
  try {
    const { id, first_name, last_name, email } = req.body;
    const sql = "UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?";
    await pool.query(sql, [first_name, last_name, email, id]);
    res.status(200).json({ message: "Profile updated successfully!" });
  } catch (error) { res.status(500).json({ error: "Failed to update profile." }); }
});

app.put("/api/user/change-password", async (req, res) => {
  try {
    const { id, currentPassword, newPassword } = req.body;
    const [users] = await pool.query("SELECT password FROM users WHERE id = ?", [id]);
    if (users.length === 0) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect current password." });
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashedNewPassword, id]);
    res.status(200).json({ message: "Password updated!" });
  } catch (error) { res.status(500).json({ error: "Failed to change password." }); }
});

// --- WATCHLIST ROUTES START HERE ---

// 1. Add to Watchlist
app.post("/api/watchlist/add", async (req, res) => {
  try {
    const { user_id, symbol } = req.body;
    const sql = "INSERT INTO watchlist (user_id, symbol) VALUES (?, ?)";
    await pool.query(sql, [user_id, symbol.toUpperCase()]);
    res.status(201).json({ message: "Added to watchlist" });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "Already watched" });
    res.status(500).json({ error: error.message });
  }
});

// 2. Remove from Watchlist
app.delete("/api/watchlist/:userId/:symbol", async (req, res) => {
  try {
    const { userId, symbol } = req.params;
    await pool.query("DELETE FROM watchlist WHERE user_id = ? AND symbol = ?", [userId, symbol.toUpperCase()]);
    res.status(200).json({ message: "Removed from watchlist" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 3. Check if stock is in Watchlist
app.get("/api/watchlist/check/:userId/:symbol", async (req, res) => {
  try {
    const { userId, symbol } = req.params;
    const [rows] = await pool.query("SELECT * FROM watchlist WHERE user_id = ? AND symbol = ?", [userId, symbol.toUpperCase()]);
    res.json({ inWatchlist: rows.length > 0 });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 4. Get Watchlist with Live Prices
app.get("/api/watchlist/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query("SELECT * FROM watchlist WHERE user_id = ?", [userId]);
    
    const watchlistData = await Promise.all(rows.map(async (item) => {
      try {
        const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${item.symbol}&token=${process.env.FINNHUB_API_KEY}`);
        return { ...item, current_price: response.data.c, change: response.data.d, percent_change: response.data.dp };
      } catch (err) { return { ...item, current_price: 0 }; }
    }));
    res.json(watchlistData);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- WATCHLIST ROUTES END HERE ---

// Portfolio Routes
app.get("/api/portfolio/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [assets] = await pool.query("SELECT * FROM assets WHERE user_id = ? AND deleted_at IS NULL", [userId]);
    const portfolioWithPrices = await Promise.all(assets.map(async (asset) => {
      try {
        const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${asset.symbol.toUpperCase()}&token=${process.env.FINNHUB_API_KEY}`);
        const currentPrice = response.data.c || 0;
        return { ...asset, current_price: currentPrice, total_value: (currentPrice * asset.quantity).toFixed(2), gain_loss: ((currentPrice - asset.purchase_price) * asset.quantity).toFixed(2) };
      } catch (err) { return { ...asset, current_price: 0 }; }
    }));
    res.json(portfolioWithPrices);
  } catch (error) { res.status(500).json({ message: "Error updating portfolio." }); }
});

app.get("/api/portfolio/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [history] = await pool.query("SELECT * FROM assets WHERE user_id = ? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC", [userId]);
    res.json(history);
  } catch (error) { res.status(500).json({ message: "Error fetching history." }); }
});

app.post("/api/assets/add", async (req, res) => {
  try {
    const { user_id, symbol, quantity, purchase_price } = req.body;
    await pool.query(`INSERT INTO assets (user_id, symbol, quantity, purchase_price) VALUES (?, ?, ?, ?)`, [user_id, symbol.toUpperCase(), quantity, purchase_price]);
    res.status(201).json({ message: "Asset added!" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete("/api/assets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE assets SET deleted_at = NOW() WHERE id = ?", [id]);
    res.status(200).json({ message: "Moved to history" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Search Routes
app.get("/api/search", async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get(`https://finnhub.io/api/v1/search?q=${q}&token=${process.env.FINNHUB_API_KEY}`);
    res.json(response.data.result || []);
  } catch (error) { res.status(500).json({ message: "Search error." }); }
});

app.get("/api/quote/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol.toUpperCase()}&token=${process.env.FINNHUB_API_KEY}`);
    res.json(response.data);
  } catch (error) { res.status(500).json({ message: "Quote error." }); }
});

app.delete("/api/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM assets WHERE user_id = ?", [id]);
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    res.status(200).json({ message: "Account deleted" });
  } catch (error) { res.status(500).json({ error: "Delete error." }); }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));