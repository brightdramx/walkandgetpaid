// index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());

const userRoutes = require('../routes/userRoutes');
app.use('/api', userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
