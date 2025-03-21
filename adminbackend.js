require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Connection Failed:", err));

// -----------------------
// Define Schemas & Models
// -----------------------

// Admin login model
const adminLoginSchema = new mongoose.Schema({
  username: String,
  loginTime: { type: Date, default: Date.now }
});
const AdminLogin = mongoose.model('AdminLogin', adminLoginSchema, 'admin_login');

// Member model
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

// Trainer model
const trainerSchema = new mongoose.Schema({
  name: String,
  email: String,
  specialization: String,
  phone: String,
  experience: Number,
  imageName: String
});
const Trainer = mongoose.model('Trainer', trainerSchema, 'trainers');

// Package model
const packageSchema = new mongoose.Schema({
  name: String,
  duration: Number,
  price: Number,
  features: String,
  imageName: String
});
const Package = mongoose.model('Package', packageSchema, 'packages');

// Equipment model
const equipmentSchema = new mongoose.Schema({
  name: String,
  brand: String,
  type: String,
  count: Number,
  imageName: String
});
const Equipment = mongoose.model('Equipment', equipmentSchema, 'equipment');

// -----------------------
// Attendance models
// -----------------------

// Member Attendance Schema (stored in "attendance")
const memberAttendanceSchema = new mongoose.Schema({
  email: String,
  date: String,      // e.g., "2025-03-20"
  clockIn: Date,
  clockOut: Date
});
const MemberAttendance = mongoose.model(
  'MemberAttendance',
  memberAttendanceSchema,
  'attendance'
);

// Trainer Attendance Schema (stored in "trainer_attendance")
const trainerAttendanceSchema = new mongoose.Schema({
  email: String,
  date: String,      // e.g., "2025-03-20"
  clockIn: Date,
  clockOut: Date
});
const TrainerAttendance = mongoose.model(
  'TrainerAttendance',
  trainerAttendanceSchema,
  'trainer_attendance'
);

// -----------------------
// Multer storage for file uploads
// -----------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// -----------------------
// Routes
// -----------------------

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

// ---------- POST Endpoints (Create Entities) ----------

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

// ---------- Attendance Endpoints ----------

// Member Attendance: Clock In (always creates a new record)
app.post('/api/attendance/clock-in', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const today = new Date().toISOString().split("T")[0];
    const newRecord = new MemberAttendance({
      email,
      date: today,
      clockIn: new Date()
    });
    await newRecord.save();
    res.json({ success: true, record: newRecord });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Member Attendance: Clock Out (updates the most recent record without a clockOut)
app.put('/api/attendance/clock-out', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const today = new Date().toISOString().split("T")[0];
    const record = await MemberAttendance.findOneAndUpdate(
      { email, date: today, clockOut: null },
      { $set: { clockOut: new Date() } },
      { new: true, sort: { clockIn: -1 } }
    );
    if (!record) return res.status(404).json({ success: false, message: "No active clock-in found for this member today" });
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Trainer Attendance: Clock In (creates a new record)
app.post('/api/attendance/trainer-clock-in', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const today = new Date().toISOString().split("T")[0];
    const newRecord = new TrainerAttendance({
      email,
      date: today,
      clockIn: new Date()
    });
    await newRecord.save();
    res.json({ success: true, record: newRecord });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Trainer Attendance: Clock Out (updates the most recent record without a clockOut)
app.put('/api/attendance/trainer-clock-out', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const today = new Date().toISOString().split("T")[0];
    const record = await TrainerAttendance.findOneAndUpdate(
      { email, date: today, clockOut: null },
      { $set: { clockOut: new Date() } },
      { new: true, sort: { clockIn: -1 } }
    );
    if (!record) return res.status(404).json({ success: false, message: "No active clock-in found for this trainer today" });
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Attendance Report for Today (fetches all member and trainer records for today)
app.get('/api/attendance/report', async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const members = await MemberAttendance.find({ date: today });
    const trainers = await TrainerAttendance.find({ date: today });
    res.json({ members, trainers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- NEW: GET Last Week Attendance Report ----------

app.get('/api/attendance/last-week', async (req, res) => {
  try {
    // Get the past 7 days including today
    const today = new Date();
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    // Aggregate member attendance records for these dates
    const memberAttendanceData = await MemberAttendance.aggregate([
      { $match: { date: { $in: dates } } },
      { $group: { _id: "$date", count: { $sum: 1 } } }
    ]);

    // Aggregate trainer attendance records for these dates
    const trainerAttendanceData = await TrainerAttendance.aggregate([
      { $match: { date: { $in: dates } } },
      { $group: { _id: "$date", count: { $sum: 1 } } }
    ]);

    // Build lookup objects for counts, defaulting to 0
    const memberCountsLookup = {};
    dates.forEach(date => memberCountsLookup[date] = 0);
    memberAttendanceData.forEach(item => {
      memberCountsLookup[item._id] = item.count;
    });

    const trainerCountsLookup = {};
    dates.forEach(date => trainerCountsLookup[date] = 0);
    trainerAttendanceData.forEach(item => {
      trainerCountsLookup[item._id] = item.count;
    });

    // Prepare arrays of counts in the same order as the dates array
    const memberCounts = dates.map(date => memberCountsLookup[date]);
    const trainerCounts = dates.map(date => trainerCountsLookup[date]);

    res.json({ dates, memberCounts, trainerCounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- PUT Endpoints (Update Entities) ----------

app.put('/api/trainers/:id', upload.single('trainerImage'), (req, res) => {
  const { trainerName, trainerEmail, trainerSpecialization, trainerPhone, trainerExperience } = req.body;
  let updateData = {
    name: trainerName,
    email: trainerEmail,
    specialization: trainerSpecialization,
    phone: trainerPhone,
    experience: Number(trainerExperience)
  };
  if (req.file) { updateData.imageName = req.file.filename; }
  Trainer.findByIdAndUpdate(req.params.id, updateData, { new: true })
    .then(updated => res.json({ success: true, updated }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

app.put('/api/members/:id', upload.single('memberImage'), (req, res) => {
  const { memberName, memberEmail, memberPhone, memberGender, memberDOB, memberAddress } = req.body;
  let updateData = {
    name: memberName,
    email: memberEmail,
    phone: memberPhone,
    gender: memberGender,
    dob: memberDOB,
    address: memberAddress
  };
  if (req.file) { updateData.imageName = req.file.filename; }
  Member.findByIdAndUpdate(req.params.id, updateData, { new: true })
    .then(updated => res.json({ success: true, updated }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

app.put('/api/packages/:id', upload.single('packageImage'), (req, res) => {
  const { packageName, packageDuration, packagePrice, packageFeatures } = req.body;
  let updateData = {
    name: packageName,
    duration: Number(packageDuration),
    price: Number(packagePrice),
    features: packageFeatures
  };
  if (req.file) { updateData.imageName = req.file.filename; }
  Package.findByIdAndUpdate(req.params.id, updateData, { new: true })
    .then(updated => res.json({ success: true, updated }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

app.put('/api/equipments/:id', upload.single('equipmentImage'), (req, res) => {
  const { equipmentName, equipmentBrand, equipmentType, equipmentCount } = req.body;
  let updateData = {
    name: equipmentName,
    brand: equipmentBrand,
    type: equipmentType,
    count: Number(equipmentCount)
  };
  if (req.file) { updateData.imageName = req.file.filename; }
  Equipment.findByIdAndUpdate(req.params.id, updateData, { new: true })
    .then(updated => res.json({ success: true, updated }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

// ---------- DELETE Endpoints ----------

app.delete('/api/trainers/:id', (req, res) => {
  Trainer.findByIdAndDelete(req.params.id)
    .then(() => res.json({ success: true }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

app.delete('/api/members/:id', (req, res) => {
  Member.findByIdAndDelete(req.params.id)
    .then(() => res.json({ success: true }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

app.delete('/api/packages/:id', (req, res) => {
  Package.findByIdAndDelete(req.params.id)
    .then(() => res.json({ success: true }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

app.delete('/api/equipments/:id', (req, res) => {
  Equipment.findByIdAndDelete(req.params.id)
    .then(() => res.json({ success: true }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

// ---------- GET Endpoints for Lists ----------

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

// Get counts for dashboard
app.get('/api/counts', async (req, res) => {
  try {
    const tc = await Trainer.countDocuments();
    const mc = await Member.countDocuments();
    const pc = await Package.countDocuments();
    const ec = await Equipment.countDocuments();
    res.json({ tc, mc, pc, ec });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------
// Start Server
// -----------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
