// 📁 server/routes/userRoutes.js

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { full_name, username, email, phone, password } = req.body;

  if (!full_name || !username || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if email already exists
    const checkEmail = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmail, [email], async (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      if (results.length > 0) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const insertUser = 'INSERT INTO users (full_name, username, email, phone, password) VALUES (?, ?, ?, ?, ?)';
      db.query(insertUser, [full_name, username, email, phone, hashedPassword], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Database insert error' });
        }
        res.status(201).json({ message: 'User registered successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
