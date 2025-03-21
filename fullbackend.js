/***************************************
 * fullbackend.js
 * Combined backend for Minnat Vigour Gym
 * Port has been changed from 3000 to 5000 throughout.
 * This file now includes PDF generation & email sending for:
 * - Claimed Offer Backend
 * - Registration Backend (already included)
 * - Schedule Backend (already included)
 * - Weight Track Backend (new endpoint)
 ***************************************/

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const app = express();
const PORT = 5000; // Changed to 5000

/***************************************
 * MIDDLEWARE & MONGODB CONNECTION
 ***************************************/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

// For file uploads (used by admin endpoints)
// const uploadDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }
// const upload = multer({
//   storage: multer.diskStorage({
//     destination: function (req, file, cb) {
//       const uploadFolder = path.join(__dirname, 'uploads', folder);
//       fs.mkdirSync(uploadFolder, { recursive: true }); // Ensure directory exists
//       cb(null, uploadFolder);
//     },
//     filename: function (req, file, cb) {
//       cb(null, Date.now() + '-' + file.originalname);
//     }
//   })
// });
const getMulterStorage = (folder) => {
  return multer.diskStorage({
      destination: (req, file, cb) => {
          const uploadFolder = path.join(__dirname, 'uploads', folder);
          fs.mkdirSync(uploadFolder, { recursive: true }); // Ensure directory exists
          cb(null, uploadFolder);
      },
      filename: (req, file, cb) => {
          cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
      }
  });
};
// Create separate upload instances for each directory
const uploadEquip = multer({ storage: getMulterStorage('equipment') });
const uploadTrainer = multer({ storage: getMulterStorage('trainer') });
const uploadMember = multer({ storage: getMulterStorage('member') });
const uploadPackage = multer({ storage: getMulterStorage('package') });


// Connect to MongoDB (all parts use the same DB)
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/minnat_vigour_gym", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Connection Failed:", err));

/***************************************
 * MODELS
 ***************************************/

// ---------- Admin & General Models ----------
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

// ---------- Attendance Models ----------
// Models
const memberAttendanceSchema = new mongoose.Schema({
    email: String,
    date: String,      // Format: "YYYY-MM-DD"
    clockIn: Date,
    clockOut: Date
  });
  const MemberAttendance = mongoose.model('MemberAttendance', memberAttendanceSchema, 'attendance');
  
  const trainerAttendanceSchema = new mongoose.Schema({
    email: String,
    date: String,      // Format: "YYYY-MM-DD"
    clockIn: Date,
    clockOut: Date
  });
  const TrainerAttendance = mongoose.model('TrainerAttendance', trainerAttendanceSchema, 'trainer_attendance');
  
  // Routes
  
  // Member Clock In
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
      res.json({ success: true, message: "Clocked in successfully", time: newRecord.clockIn });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  
  // Trainer Clock Out
  app.put('/api/attendance/trainer-clock-out', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });
      const today = new Date().toISOString().split("T")[0];
      const record = await TrainerAttendance.findOneAndUpdate(
        { email, date: today, clockOut: null },
        { clockOut: new Date() },
        { new: true, sort: { clockIn: -1 } }
      );
      if (!record) {
        return res.status(404).json({ message: "No active clock-in found" });
      }
      res.json({ success: true, message: "Clocked out successfully", time: record.clockOut });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  
  // ... [other routes]
// ---------- Registration Model ----------
const registrationSchema = new mongoose.Schema({
  gender: String,
  name: String,
  dob: String,
  contactNo: String,
  email: String,
  plans: String,
  height: Number,
  weight: Number,
  timeSlot: String,
  date: { type: Date, default: Date.now }
});
const Registration = mongoose.model("Registration", registrationSchema, "registrations");

// ---------- Claim Offer Model ----------
const claimedOfferSchema = new mongoose.Schema({
  name: String,
  email: String,
  claimedAt: { type: Date, default: Date.now }
});
const ClaimedOffer = mongoose.model('ClaimedOffer', claimedOfferSchema, 'claimed_offers');

// ---------- Schedule Model ----------
const scheduleSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  timeSlot: String,
  duration: String,
  goal: String,
  sessionType: String,
  workoutType: [String],
  workoutDays: [String]
}, { collection: "schedules" });
const Schedule = mongoose.model("Schedule", scheduleSchema);

// ---------- Weight Track Model (Updated) ----------
const weightSchema = new mongoose.Schema({
  emailID: { type: String, required: true },
  currentWeight: { type: Number, required: true },
  targetWeight: { type: Number, required: true },
  timePeriod: { type: String, required: true },
  createdDate: { type: Date, default: Date.now }
});
const Weight = mongoose.model("Weight", weightSchema, "weight_tracks");

// ---------- Enquiry & Feedback Models ----------
const enquirySchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const Enquiry = mongoose.model("Enquiry", enquirySchema, "enquiries");

const feedbackSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  cleanlinessRating: { type: Number, required: true },
  equipmentRating: { type: Number, required: true },
  trainerRating: { type: Number, required: true },
  comments: { type: String }
});
const Feedback = mongoose.model("Feedback", feedbackSchema);

/***************************************
 * ROUTES
 ***************************************/

/* ========= ADMIN BACKEND ROUTES ========= */

// Login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const newLogin = new AdminLogin({ username });
    newLogin.save()
      .then(() => res.json({ success: true }))
      .catch(err => res.status(500).json({ success: false, error: err.message }));
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Create Trainer
app.post('/api/trainers', uploadTrainer.single('trainerImage'), (req, res) => {
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

// Create Member
app.post('/api/members', uploadMember.single('memberImage'), (req, res) => {
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

// Create Package
app.post('/api/packages', uploadPackage.single('packageImage'), (req, res) => {
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

// Create Equipment
app.post('/api/equipments', uploadEquip.single('equipmentImage'), (req, res) => {
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

/* ========= ATTENDANCE ENDPOINTS ========= */

// Member Clock In
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

// Member Clock Out
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

// Trainer Clock In
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

// Trainer Clock Out
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

// GET Today's Attendance Report (Members & Trainers)
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

// GET Last Week Attendance Report (Aggregated)
app.get('/api/attendance/last-week', async (req, res) => {
  try {
    const today = new Date();
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    const memberData = await MemberAttendance.aggregate([
      { $match: { date: { $in: dates } } },
      { $group: { _id: "$date", count: { $sum: 1 } } }
    ]);
    const trainerData = await TrainerAttendance.aggregate([
      { $match: { date: { $in: dates } } },
      { $group: { _id: "$date", count: { $sum: 1 } } }
    ]);
    const memberCounts = dates.map(date => {
      const found = memberData.find(item => item._id === date);
      return found ? found.count : 0;
    });
    const trainerCounts = dates.map(date => {
      const found = trainerData.find(item => item._id === date);
      return found ? found.count : 0;
    });
    res.json({ dates, memberCounts, trainerCounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ========= UPDATE & DELETE ENDPOINTS ========= */
app.put('/api/trainers/:id', uploadTrainer.single('trainerImage'), (req, res) => {
  const { trainerName, trainerEmail, trainerSpecialization, trainerPhone, trainerExperience } = req.body;
  let updateData = {
    name: trainerName,
    email: trainerEmail,
    specialization: trainerSpecialization,
    phone: trainerPhone,
    experience: Number(trainerExperience)
  };
  if (req.file) updateData.imageName = req.file.filename;
  Trainer.findByIdAndUpdate(req.params.id, updateData, { new: true })
    .then(updated => res.json({ success: true, updated }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

app.put('/api/members/:id', uploadMember.single('memberImage'), (req, res) => {
  const { memberName, memberEmail, memberPhone, memberGender, memberDOB, memberAddress } = req.body;
  let updateData = {
    name: memberName,
    email: memberEmail,
    phone: memberPhone,
    gender: memberGender,
    dob: memberDOB,
    address: memberAddress
  };
  if (req.file) updateData.imageName = req.file.filename;
  Member.findByIdAndUpdate(req.params.id, updateData, { new: true })
    .then(updated => res.json({ success: true, updated }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

app.put('/api/packages/:id', uploadPackage.single('packageImage'), (req, res) => {
  const { packageName, packageDuration, packagePrice, packageFeatures } = req.body;
  let updateData = {
    name: packageName,
    duration: Number(packageDuration),
    price: Number(packagePrice),
    features: packageFeatures
  };
  if (req.file) updateData.imageName = req.file.filename;
  Package.findByIdAndUpdate(req.params.id, updateData, { new: true })
    .then(updated => res.json({ success: true, updated }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

app.put('/api/equipments/:id', uploadEquip.single('equipmentImage'), (req, res) => {
  const { equipmentName, equipmentBrand, equipmentType, equipmentCount } = req.body;
  let updateData = {
    name: equipmentName,
    brand: equipmentBrand,
    type: equipmentType,
    count: Number(equipmentCount)
  };
  if (req.file) updateData.imageName = req.file.filename;
  Equipment.findByIdAndUpdate(req.params.id, updateData, { new: true })
    .then(updated => res.json({ success: true, updated }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

// DELETE Endpoints
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
app.delete('/api/enquirys/:id', (req, res) => {
  Enquiry.findByIdAndDelete(req.params.id)
    .then(() => res.json({ success: true }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

/* ========= GET LISTS ========= */
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
app.get('/api/enquiry', async (req,res) => {
  Enquiry.find()
    .then(enq => res.json(enq))
    .catch(err => res.status(500).json({ error: err.message }));
})
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

/* ========= CLAIM OFFER BACKEND (with PDF Generation) ========= */
app.post('/claim-offer', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required.' });
  }
  try {
    // Check registration first
    const user = await Registration.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User does not exist. Please register first.' });
    }
    // Check if already claimed
    const alreadyClaimed = await ClaimedOffer.findOne({ email });
    if (alreadyClaimed) {
      return res.status(400).json({ success: false, message: 'You have already claimed this offer.' });
    }
    const claim = await ClaimedOffer.create({ name, email });
    
    // Generate PDF for claim details
    const pdfPath = path.join(__dirname, `claim_${Date.now()}.pdf`);
    const doc = new PDFDocument();
    const pdfStream = fs.createWriteStream(pdfPath);
    doc.pipe(pdfStream);
    doc.fontSize(16).text("Claimed Offer Details", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Name: ${name}`);
    doc.text(`Email: ${email}`);
    doc.text(`Claimed At: ${claim.claimedAt}`);
    doc.end();
    
    pdfStream.on("finish", async () => {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Claimed Offer Details',
        text: "Please find attached the details of your claimed offer.",
        attachments: [{
          filename: "claim.pdf",
          path: pdfPath,
          contentType: "application/pdf"
        }]
      };
      try {
        await transporter.sendMail(mailOptions);
        fs.unlink(pdfPath, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting claim PDF:", unlinkErr);
        });
        res.status(200).json({ success: true, message: 'Offer claimed successfully! Details sent via email.' });
      } catch (emailError) {
        res.status(500).json({ success: false, message: "Offer claimed but email sending failed.", error: emailError.message });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

/* ========= REGISTRATION BACKEND (Already includes PDF Generation) ========= */
app.post('/register', async (req, res) => {
  try {
    const { name, email } = req.body;
    const existingUser = await Registration.findOne({ $or: [{ name }, { email }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this name or email already exists." });
    }
    const newRegistration = new Registration(req.body);
    await newRegistration.save();
    // Generate PDF receipt
    const billsDir = "./bills";
    if (!fs.existsSync(billsDir)) {
      fs.mkdirSync(billsDir);
    }
    const pdfPath = `${billsDir}/${email}_receipt.pdf`;
    const doc = new PDFDocument();
    const pdfStream = fs.createWriteStream(pdfPath);
    doc.pipe(pdfStream);
    doc.fontSize(18).text("Minnat Vigour Gym - Registration Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Name: ${req.body.name}`);
    doc.text(`Email: ${req.body.email}`);
    doc.text(`Contact: ${req.body.contactNo}`);
    doc.text(`Plan: ₹${req.body.plans}`);
    doc.text(`Height: ${req.body.height} cm`);
    doc.text(`Weight: ${req.body.weight} kg`);
    doc.text(`Time Slot: ${req.body.timeSlot}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.end();
    pdfStream.on("finish", async () => {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Gym Registration Confirmation",
        text: "Thank you for registering at Minnat Vigour Gym. Your payment receipt is attached.",
        attachments: [{ filename: "receipt.pdf", path: pdfPath }],
      };
      try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Registration successful! Receipt sent to email." });
      } catch (emailError) {
        res.status(500).json({ success: false, message: "Registration successful, but email sending failed." });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Registration failed. Please try again later." });
  }
});

app.get("/api/registrations", async (req, res) => {
  try {
    const registrations = await Registration.find();
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching data." });
  }
});

/* ========= SCHEDULE BACKEND (Already includes PDF Generation) ========= */
app.post("/schedule", async (req, res) => {
  try {
    const { name, email, phone, timeSlot, duration, goal, sessionType, workoutType, workoutDays } = req.body;
    // Check if user is registered
    const registeredUser = await Registration.findOne({ email });
    if (!registeredUser) {
      return res.status(403).json({ message: "You are not a member. Please register first." });
    }
    const newSchedule = new Schedule({ name, email, phone, timeSlot, duration, goal, sessionType, workoutType, workoutDays });
    await newSchedule.save();
    // Generate PDF for schedule confirmation
    const fileName = `schedule_${Date.now()}.pdf`;
    const pdfPath = path.join(__dirname, fileName);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);
    doc.fontSize(20).text("Gym Schedule Confirmation", { align: "center" }).moveDown(1);
    doc.fontSize(14).text(`Name: ${name}`);
    doc.text(`Email: ${email}`);
    doc.text(`Phone: ${phone}`);
    doc.text(`Time Slot: ${timeSlot}`);
    doc.text(`Duration: ${duration}`);
    doc.text(`Goal: ${goal}`);
    doc.text(`Session Type: ${sessionType}`);
    doc.text(`Workout Type: ${workoutType.join(", ")}`);
    doc.text(`Workout Days: ${workoutDays.join(", ")}`);
    doc.end();
    stream.on("finish", () => {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      const mailOptions = {
        from: `"Minnat Vigour Gym" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Gym Schedule Confirmation",
        text: `Hello ${name},\n\nThank you for scheduling your gym session with us. Attached is your confirmation.\n\nBest Regards,\nMinnat Vigour Gym`,
        attachments: [{
          filename: "Gym_Schedule.pdf",
          path: pdfPath,
          contentType: "application/pdf"
        }]
      };
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          return res.status(500).json({ message: "Email sending failed", error: err.message });
        }
        fs.unlink(pdfPath, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting PDF:", unlinkErr);
        });
        res.status(200).json({ message: "Schedule created and email sent successfully!" });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error. Try again!", error: error.message });
  }
});

/* ========= WEIGHT TRACK BACKEND (Updated) ========= */
app.post('/api/weight-track', async (req, res) => {
  try {
    const { emailID, currentWeight, targetWeight, timePeriod } = req.body;
    if (!emailID || currentWeight == null || targetWeight == null || !timePeriod) {
      return res.status(400).json({ success: false, message: "emailID, currentWeight, targetWeight, and timePeriod are required." });
    }
    const newWeight = new Weight({
      emailID,
      currentWeight,
      targetWeight,
      timePeriod,
      createdDate: new Date()
    });
    await newWeight.save();
    // Generate PDF summary of weight tracking
    const pdfPath = path.join(__dirname, `weighttrack_${Date.now()}.pdf`);
    const doc = new PDFDocument();
    const pdfStream = fs.createWriteStream(pdfPath);
    doc.pipe(pdfStream);
    doc.fontSize(16).text("Weight Tracking Summary", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Email: ${emailID}`);
    doc.text(`Current Weight: ${currentWeight} kg`);
    doc.text(`Target Weight: ${targetWeight} kg`);
    doc.text(`Time Period: ${timePeriod}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.end();
    pdfStream.on("finish", async () => {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emailID,
        subject: "Weight Tracking Details",
        text: "Please find attached your weight tracking summary.",
        attachments: [{
          filename: "weighttrack.pdf",
          path: pdfPath,
          contentType: "application/pdf"
        }]
      };
      try {
        await transporter.sendMail(mailOptions);
        fs.unlink(pdfPath, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting weight track PDF:", unlinkErr);
        });
        res.status(200).json({ success: true, message: "Weight tracking data saved and summary sent via email." });
      } catch (emailError) {
        res.status(500).json({ success: false, message: "Data saved but email sending failed.", error: emailError.message });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error saving weight track data.", error: error.message });
  }
});

// GET endpoint to fetch weight history by emailID
app.get('/weight-history/:emailID', async (req, res) => {
  try {
    const emailID = req.params.emailID;
    const records = await Weight.find({ emailID });
    res.json(records);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching weight history.", error: error.message });
  }
});

/* ========= SERVER BACKEND (Enquiry & Feedback with PDF Email) ========= */
// Enquiry Endpoint with PDF attachment
app.post('/api/enquiry', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const newEnquiry = new Enquiry({ name, email, phone, message });
    await newEnquiry.save();
    
    // Generate PDF of enquiry details
    const pdfPath = path.join(__dirname, `enquiry_${Date.now()}.pdf`);
    const doc = new PDFDocument();
    const pdfStream = fs.createWriteStream(pdfPath);
    doc.pipe(pdfStream);
    doc.fontSize(16).text("Enquiry Details", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Name: ${name}`);
    doc.text(`Email: ${email}`);
    doc.text(`Phone: ${phone}`);
    doc.text(`Message: ${message}`);
    doc.end();
    
    pdfStream.on("finish", async () => {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Enquiry Details",
        text: "Please find attached the details of your enquiry.",
        attachments: [{
          filename: "enquiry.pdf",
          path: pdfPath,
          contentType: "application/pdf"
        }]
      };
      try {
        await transporter.sendMail(mailOptions);
        fs.unlink(pdfPath, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting enquiry PDF:", unlinkErr);
        });
        res.status(200).json({ success: true, message: "Enquiry submitted and details sent via email." });
      } catch (emailError) {
        res.status(500).json({ success: false, message: "Enquiry submitted but email sending failed.", error: emailError.message });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error submitting enquiry.", error: error.message });
  }
});

// Feedback Endpoint with PDF attachment
app.post('/api/feedback', async (req, res) => {
  try {
    console.log("Feedback received:", req.body);
    const feedback = new Feedback(req.body);
    await feedback.save();
    
    const { firstName, lastName, email, cleanlinessRating, equipmentRating, trainerRating, comments } = req.body;
    const pdfPath = path.join(__dirname, `feedback_${Date.now()}.pdf`);
    const doc = new PDFDocument();
    const pdfStream = fs.createWriteStream(pdfPath);
    doc.pipe(pdfStream);
    doc.fontSize(16).text("Feedback Details", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Name: ${firstName} ${lastName}`);
    doc.text(`Email: ${email}`);
    doc.text(`Cleanliness Rating: ${cleanlinessRating}`);
    doc.text(`Equipment Rating: ${equipmentRating}`);
    doc.text(`Trainer Rating: ${trainerRating}`);
    if (comments) {
      doc.text(`Comments: ${comments}`);
    }
    doc.end();
    
    pdfStream.on("finish", async () => {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Feedback Details",
        text: "Thank you for your feedback. Attached is a summary of your submitted feedback.",
        attachments: [{
          filename: "feedback.pdf",
          path: pdfPath,
          contentType: "application/pdf"
        }]
      };
      try {
        await transporter.sendMail(mailOptions);
        fs.unlink(pdfPath, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting feedback PDF:", unlinkErr);
        });
        res.status(200).json({ success: true, message: "Feedback submitted and details sent via email." });
      } catch (emailError) {
        res.status(500).json({ success: false, message: "Feedback submitted but email sending failed.", error: emailError.message });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error submitting feedback.", error: error.message });
  }
});

/***************************************
 * START SERVER
 ***************************************/
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`); // Port changed to 5000
});
