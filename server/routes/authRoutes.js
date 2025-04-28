// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

// If you have your own SMS sending function, import it here
const { sendSMS } = require('../utils/smsService'); // 🔥 We will build smsService.js separately

// ✅ Register
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

// ✅ Login (by Email or Phone)
router.post('/login', (req, res) => {
  const { email_or_phone, password } = req.body;

  if (!email_or_phone || !password) {
    return res.status(400).json({ message: 'Phone/Email and password are required' });
  }

  const query = 'SELECT * FROM users WHERE email = ? OR phone = ?';
  db.query(query, [email_or_phone, email_or_phone], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
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

// ✅ Forgot Password (Request Reset)
router.post('/forgot-password', (req, res) => {
  const { email_or_phone } = req.body;

  if (!email_or_phone) {
    return res.status(400).json({ message: 'Phone or email is required' });
  }

  const findUser = 'SELECT * FROM users WHERE email = ? OR phone = ?';
  db.query(findUser, [email_or_phone, email_or_phone], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (results.length === 0) {
      return res.status(404).json({ message: 'No account found with that email or phone' });
    }

    const user = results[0];

    // Generate 6-digit random code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update reset_code in database
    const updateResetCode = 'UPDATE users SET reset_code = ? WHERE id = ?';
    db.query(updateResetCode, [resetCode, user.id], async (err) => {
      if (err) return res.status(500).json({ message: 'Database error during reset code update' });

      try {
        // Send SMS (you must setup your SMS function)
        await sendSMS(user.phone, `Your DBCD password reset code is: ${resetCode}`);
        return res.json({ message: 'Reset code sent successfully!' });
      } catch (smsError) {
        console.error('SMS sending error:', smsError);
        return res.status(500).json({ message: 'Failed to send reset code' });
      }
    });
  });
});

// ✅ Reset Password
router.post('/reset-password', async (req, res) => {
  const { email_or_phone, reset_code, new_password } = req.body;

  if (!email_or_phone || !reset_code || !new_password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const findUser = 'SELECT * FROM users WHERE (email = ? OR phone = ?) AND reset_code = ?';
  db.query(findUser, [email_or_phone, email_or_phone, reset_code], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid reset code or phone/email' });
    }

    const user = results[0];
    const hashedPassword = await bcrypt.hash(new_password, 10);

    const updatePassword = 'UPDATE users SET password = ?, reset_code = NULL WHERE id = ?';
    db.query(updatePassword, [hashedPassword, user.id], (err) => {
      if (err) return res.status(500).json({ message: 'Database error during password reset' });

      res.json({ message: 'Password reset successfully!' });
    });
  });
});

module.exports = router;
