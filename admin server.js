// server.js
require('dotenv').config(); // Loads variables from .env file into process.env
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(cors());

// Use environment variables for admin credentials, with defaults as fallback
const adminCredentials = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123'
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide both username and password.' });
  }

  // Validate credentials
  if (username === adminCredentials.username && password === adminCredentials.password) {
    return res.status(200).json({
      message: 'Login successful',
      token: 'your_generated_token_here'
    });
  } else {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
});

// Start the server on the port specified in the environment variables
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
