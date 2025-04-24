const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { full_name, username, email, password } = req.body;
  try {
    // Check if email or username already exists
    const checkQuery = 'SELECT * FROM users WHERE email = ? OR username = ?';
    db.query(checkQuery, [email, username], async (err, results) => {
      if (err) return res.status(500).json({ message: 'Error checking user', error: err });

      if (results.length > 0) {
        return res.status(400).json({ message: 'Email or username already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const insertQuery = 'INSERT INTO users (full_name, username, email, password) VALUES (?, ?, ?, ?)';
      db.query(insertQuery, [full_name, username, email, hashedPassword], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error registering user', error: err });
        res.status(201).json({ message: 'User registered successfully' });
      });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});



// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      res.status(200).json({ message: 'Login successful', user });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

module.exports = router;
