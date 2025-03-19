// adminbackend.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve static files (for uploaded images)
app.use('/uploads', express.static(uploadDir));

// MongoDB Connection (options removed to avoid deprecated warnings)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Define Schemas & Models
const adminLoginSchema = new mongoose.Schema({
  username: String,
  loginTime: { type: Date, default: Date.now }
});
const AdminLogin = mongoose.model('AdminLogin', adminLoginSchema, 'admin_login');

const memberSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  gender: String,
  dob: Date,
  address: String,
  imageName: String
});
const Member = mongoose.model('Member', memberSchema, 'members');

const trainerSchema = new mongoose.Schema({
  name: String,
  email: String,
  specialization: String,
  phone: String,
  experience: Number,
  imageName: String
});
const Trainer = mongoose.model('Trainer', trainerSchema, 'trainers');

const packageSchema = new mongoose.Schema({
  name: String,
  duration: Number,
  price: Number,
  features: String,
  imageName: String
});
const Package = mongoose.model('Package', packageSchema, 'packages');

const equipmentSchema = new mongoose.Schema({
  name: String,
  brand: String,
  type: String,
  count: Number,
  imageName: String
});
const Equipment = mongoose.model('Equipment', equipmentSchema, 'equipment');

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ------------------------
// Routes
// ------------------------

// Login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const newLogin = new AdminLogin({ username });
    newLogin.save()
      .then(() => res.json({ success: true }))
      .catch(err => res.status(500).json({ success: false, error: err.message }));
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// POST endpoints for forms

// Trainer endpoint
app.post('/api/trainers', upload.single('trainerImage'), (req, res) => {
  const { trainerName, trainerEmail, trainerSpecialization, trainerPhone, trainerExperience } = req.body;
  const imageName = req.file ? req.file.filename : '';
  const trainer = new Trainer({
    name: trainerName,
    email: trainerEmail,
    specialization: trainerSpecialization,
    phone: trainerPhone,
    experience: Number(trainerExperience),
    imageName
  });
  trainer.save()
    .then(() => res.json({ success: true }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

// Member endpoint
app.post('/api/members', upload.single('memberImage'), (req, res) => {
  const { memberName, memberEmail, memberPhone, memberGender, memberDOB, memberAddress } = req.body;
  const imageName = req.file ? req.file.filename : '';
  const member = new Member({
    name: memberName,
    email: memberEmail,
    phone: memberPhone,
    gender: memberGender,
    dob: memberDOB,
    address: memberAddress,
    imageName
  });
  member.save()
    .then(() => res.json({ success: true }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

// Package endpoint
app.post('/api/packages', upload.single('packageImage'), (req, res) => {
  const { packageName, packageDuration, packagePrice, packageFeatures } = req.body;
  const imageName = req.file ? req.file.filename : '';
  const pack = new Package({
    name: packageName,
    duration: Number(packageDuration),
    price: Number(packagePrice),
    features: packageFeatures,
    imageName
  });
  pack.save()
    .then(() => res.json({ success: true }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

// Equipment endpoint
app.post('/api/equipments', upload.single('equipmentImage'), (req, res) => {
  const { equipmentName, equipmentBrand, equipmentType, equipmentCount } = req.body;
  const imageName = req.file ? req.file.filename : '';
  const equipment = new Equipment({
    name: equipmentName,
    brand: equipmentBrand,
    type: equipmentType,
    count: Number(equipmentCount),
    imageName
  });
  equipment.save()
    .then(() => res.json({ success: true }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

// GET endpoints to fetch lists

app.get('/api/trainers', (req, res) => {
  Trainer.find()
    .then(trainers => res.json(trainers))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/api/members', (req, res) => {
  Member.find()
    .then(members => res.json(members))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/api/packages', (req, res) => {
  Package.find()
    .then(packages => res.json(packages))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/api/equipments', (req, res) => {
  Equipment.find()
    .then(equipments => res.json(equipments))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
