// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Register a new user
router.post('/register', (req, res) => {
  const { username } = req.body;
  db.query('INSERT INTO users (username, balance) VALUES (?, ?)', [username, 0], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ userId: result.insertId, username, balance: 0 });
  });
});

// Update balance
router.post('/update-balance', (req, res) => {
  const { userId, amount } = req.body;
  db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, userId], (err) => {
    if (err) return res.status(500).send(err);
    res.send({ success: true });
  });
});

// Get user
router.get('/user/:id', (req, res) => {
  db.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results[0]);
  });
});

module.exports = router;
