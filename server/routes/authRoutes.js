// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();




// Register Route
router.post('/register', async (req, res) => {
  const { full_name, username, email, phone, password } = req.body;

  if (!full_name || !username || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (full_name, username, email, phone, password) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [full_name, username, email, phone, hashedPassword], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      return res.status(201).json({ message: 'User registered successfully' });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});


// ✅ Login Route Only
router.post('/login', (req, res) => {
  console.log('Login attempt:', req.body);
  const { full_name, username, email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';
  
  db.query(query, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  
    if (results.length === 0) {
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


// Forgot Password (Request Reset)
router.post('/forgot-password', (req, res) => {
  const { email_or_phone } = req.body;

  if (!email_or_phone) {
    return res.status(400).json({ message: 'Email or phone is required' });
  }

  // Find user by email or phone
  const findUser = 'SELECT * FROM users WHERE email = ? OR phone = ?';
  db.query(findUser, [email_or_phone, email_or_phone], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (results.length === 0) {
      return res.status(404).json({ message: 'No account found with that email or phone' });
    }

    const user = results[0];

    // Generate random 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update user's reset_code
    const updateResetCode = 'UPDATE users SET reset_code = ? WHERE id = ?';
    db.query(updateResetCode, [resetCode, user.id], (err, updateResult) => {
      if (err) return res.status(500).json({ message: 'Database error during reset code update' });

      // 🛎 Normally you would send code via SMS or Email here
      console.log('Password reset code:', resetCode); // For now, just log it

      res.json({ message: 'Reset code generated. Please check your email or phone (for now, check console).' });
    });
  });
});


// Verify Reset Code and Set New Password
router.post('/reset-password', async (req, res) => {
  const { email_or_phone, reset_code, new_password } = req.body;

  if (!email_or_phone || !reset_code || !new_password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Find user
  const findUser = 'SELECT * FROM users WHERE (email = ? OR phone = ?) AND reset_code = ?';
  db.query(findUser, [email_or_phone, email_or_phone, reset_code], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid reset code or email/phone' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password and clear reset_code
    const updatePassword = 'UPDATE users SET password = ?, reset_code = NULL WHERE id = ?';
    db.query(updatePassword, [hashedPassword, results[0].id], (err, updateResult) => {
      if (err) return res.status(500).json({ message: 'Database error during password reset' });

      res.json({ message: 'Password has been reset successfully!' });
    });
  });
});


module.exports = router;


