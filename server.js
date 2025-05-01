// server/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json()); // ✅ REQUIRED to parse JSON body
app.use(cors());
app.use(bodyParser.json());

// ✅ Routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/users', userRoutes); // /api/users/register, /api/users/user/:id, etc.
app.use('/api/auth', authRoutes);  // /api/auth/login
app.use('/api/auth', require('./routes/authRoutes'));


// ✅ Serve frontend static files (optional, if frontend is inside /public)
app.use(express.static(path.join(__dirname, '../public')));

// ✅ Catch-all route for SPA (optional)
// ✅ Correct
//app.get('*', (req, res) => {
//res.sendFile(path.join(__dirname, '../public/index.html'));
//});


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});


app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});
