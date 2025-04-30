const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8081;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "shriyash27@",
  database: "personal_budget"
});

db.connect(err => {
  if (err) throw err;
  console.log("✅ Connected to MySQL");
});

// Add Transaction
app.post("/transactions", (req, res) => {
  const { user_id, type, amount, category, description } = req.body;
  const q = `INSERT INTO transactions (user_id, type, amount, category, description) VALUES (?, ?, ?, ?, ?)`;
  db.query(q, [user_id, type, amount, category, description], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Transaction added", id: result.insertId });
  });
});

// Get Transactions for a user
app.get("/transactions/:user_id", (req, res) => {
  const q = `SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC`;
  db.query(q, [req.params.user_id], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

// Summary: Income, Expense, Balance
app.get("/transactions/summary/:user_id", (req, res) => {
  const user_id = req.params.user_id;
  const q = `
    SELECT 
      SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) AS total_income,
      SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) AS total_expense,
      SUM(CASE WHEN type = 'Income' THEN amount ELSE -amount END) AS balance
    FROM transactions WHERE user_id = ?
  `;
  db.query(q, [user_id], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data[0]);
  });
});

// Update a transaction
app.put("/transactions/:id", (req, res) => {
  const { type, amount, category, description } = req.body;
  const q = `UPDATE transactions SET type=?, amount=?, category=?, description=? WHERE id=?`;
  db.query(q, [type, amount, category, description, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Transaction updated" });
  });
});

// Delete a transaction
app.delete("/transactions/:id", (req, res) => {
  db.query(`DELETE FROM transactions WHERE id = ?`, [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Transaction deleted" });
  });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
