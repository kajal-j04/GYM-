// server.js
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Connect to MongoDB (update the connection string as needed)
mongoose.connect('mongodb://localhost:27017/gymDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB.'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ------------------
// SCHEMA DEFINITIONS
// ------------------

// User Schema for admin login
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true } // In production, store hashed passwords.
});
const User = mongoose.model('User', userSchema);

// Trainer Schema
const trainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  specialization: { type: String, required: true },
  phone: { type: String, required: true },
  experience: { type: Number, required: true }
});
const Trainer = mongoose.model('Trainer', trainerSchema);

// Member Schema
const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  gender: { type: String, required: true },
  dob: { type: Date, required: true },
  address: { type: String }
});
const Member = mongoose.model('Member', memberSchema);

// Package Schema
const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true }, // in months
  price: { type: Number, required: true },
  features: { type: String }
});
const Package = mongoose.model('Package', packageSchema);

// Equipment Schema
const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  type: { type: String, required: true },
  count: { type: Number, required: true }
});
const Equipment = mongoose.model('Equipment', equipmentSchema);

// ------------------
// API ENDPOINTS
// ------------------

// Login endpoint (dummy authentication for demo)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.json({ success: true, token: 'dummy-token', message: 'Login successful.' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ---------- Trainer Endpoints ----------
app.get('/api/trainers', async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

app.post('/api/trainers', async (req, res) => {
  try {
    const trainer = new Trainer(req.body);
    await trainer.save();
    res.json({ success: true, trainer, message: 'Trainer added successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding trainer.', error: err });
  }
});

// ---------- Member Endpoints ----------
app.get('/api/members', async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

app.post('/api/members', async (req, res) => {
  try {
    const member = new Member(req.body);
    await member.save();
    res.json({ success: true, member, message: 'Member added successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding member.', error: err });
  }
});

// ---------- Package Endpoints ----------
app.get('/api/packages', async (req, res) => {
  try {
    const pkgs = await Package.find();
    res.json(pkgs);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

app.post('/api/packages', async (req, res) => {
  try {
    const pkg = new Package(req.body);
    await pkg.save();
    res.json({ success: true, pkg, message: 'Package added successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding package.', error: err });
  }
});

// ---------- Equipment Endpoints ----------
app.get('/api/equipment', async (req, res) => {
  try {
    const equipments = await Equipment.find();
    res.json(equipments);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

app.post('/api/equipment', async (req, res) => {
  try {
    const equipment = new Equipment(req.body);
    await equipment.save();
    res.json({ success: true, equipment, message: 'Equipment added successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding equipment.', error: err });
  }
});

// ------------------~
// START THE SERVER
// ------------------
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
