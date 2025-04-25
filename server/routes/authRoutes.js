// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

// ✅ Login Route Only
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';
  
  db.query(query, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

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
