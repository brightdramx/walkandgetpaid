// index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000; // fallback in case .env is missing

app.use(cors());
app.use(bodyParser.json());

// ✅ Correct path to userRoutes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes); // Final route: /api/users/register, etc.

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
