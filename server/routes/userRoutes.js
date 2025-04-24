// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Register a new user

router.post('/register', async (req, res) => {
  const { full_name, username, email, password } = req.body;

  try {
    const checkQuery = 'SELECT * FROM users WHERE email = ? OR username = ?';
    db.query(checkQuery, [email, username], async (err, results) => {
      if (err) return res.status(500).json({ message: 'Error checking user', error: err });

      if (results.length > 0) {
        return res.status(400).json({ message: 'Email or username already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const insertQuery = 'INSERT INTO users (full_name, username, email, password) VALUES (?, ?, ?, ?)';
      db.query(insertQuery, [full_name, username, email, hashedPassword], (err) => {
        if (err) return res.status(500).json({ message: 'Error registering user', error: err });

        // ✅ Send proper JSON response here
        return res.status(201).json({ message: 'User registered successfully' });
      });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
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
