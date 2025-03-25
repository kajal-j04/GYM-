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
const router = express.Router();
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

// Define the MarkedAttendance schema and model
const markedAttendanceSchema = new mongoose.Schema({
  email: { type: String, required: true },
  clockIn: { type: Date, required: true },
  clockOut: { type: Date },
  markedAt: { type: Date, default: Date.now }
});
const MarkedAttendance = mongoose.model("MarkedAttendance", markedAttendanceSchema, "marked_attendance");


// ---------- Attendance Models ----------
// Models
const attendanceSchema = new mongoose.Schema({
  email: { type: String, required: true },
  clockIn: { type: Date, required: true },
  clockOut: { type: Date, default: null }
});

const Attendance = mongoose.model("attendance", attendanceSchema, "attendance");

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
  
// Mark Attendance API Endpoint
// Mark Attendance Endpoint
app.put('/api/attendance/mark/:id', async (req, res) => {
  try {
    const { id } = req.params; // id of the attendance record to mark
    // First, try to find the record in MemberAttendance
    let record = await MemberAttendance.findById(id);
    if (!record) {
      // If not found, check in TrainerAttendance
      record = await TrainerAttendance.findById(id);
      if (!record) return res.status(404).json({ success: false, message: "Attendance record not found" });
    }
    
    // Create a new marked attendance record in marked_attendance collection.
    const marked = new MarkedAttendance({
      email: record.email,
      clockIn: record.clockIn,
      clockOut: record.clockOut
    });
    await marked.save();
    res.json({ success: true, message: "Attendance marked successfully", marked });
  } catch (error) {
    console.error("❌ Error marking attendance:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});


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

  // ✅ Member Clock-Out API Route
  app.put('/api/attendance/clock-out', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }
  
        // Use today's date (as stored in clock-in)
        const today = new Date().toISOString().split("T")[0];
  
        // Use the MemberAttendance model (which was used for clock-in)
        const attendanceRecord = await MemberAttendance.findOneAndUpdate(
            { email, date: today, clockOut: null },
            { $set: { clockOut: new Date() } },
            { new: true, sort: { clockIn: -1 } }
        );
  
        if (!attendanceRecord) {
            return res.status(404).json({ success: false, message: "No active clock-in found for this member today" });
        }
  
        res.json({ success: true, message: "Clocked out successfully", time: attendanceRecord.clockOut });
    } catch (error) {
        console.error("❌ Clock-Out Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  });
  


// Trainer Clock In
app.post('/api/attendance/trainer-clock-in', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const trainer = await Trainer.findOne({ email });
        if (!trainer) return res.status(404).json({ message: "Trainer not found" });

        const clockInTime = new Date();

        const attendance = new TrainerAttendance({
            email,
            name: trainer.name,
            clockIn: clockInTime,
            clockOut: null,
        });

        await attendance.save();
        res.json({ success: true, message: "Clocked in successfully", time: clockInTime });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


  
  // Trainer Clock Out
  app.put('/api/attendance/trainer-clock-out', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });

        // Find the latest active clock-in for this trainer (ensure correct matching)
        console.log("🔍 Searching for active clock-in...");
        const record = await TrainerAttendance.findOneAndUpdate(
            { email, clockOut: null },  // 🔹 Fix: Remove date filter, just check clockOut is null
            { clockOut: new Date() },
            { new: true, sort: { clockIn: -1 } }
        );

        if (!record) {
            console.log("⚠️ No active clock-in found!");
            return res.status(404).json({ success: false, message: "No active clock-in found" });
        }

        console.log("✅ Trainer Clocked Out:", record);
        res.json({ success: true, message: "Clocked out successfully", time: record.clockOut });
    } catch (err) {
        console.error("❌ Clock-Out Error:", err);
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
// Schema for Weight Tracking
const weightSchema = new mongoose.Schema({
  emailID: { type: String, required: true },
  currentWeight: { type: Number, required: true },
  targetWeight: { type: Number, required: true },
  timePeriod: { type: String, required: true },
  createdDate: { type: Date, default: Date.now },
});

const Weight = mongoose.model("weight_track", weightSchema);
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
    res.json({ success: true, record: newRecord, message: 'clocked in' });
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
    res.json({ success: true, record, message: 'clocked out' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Check if Trainer is Registered (For Attendance)
app.get("/api/check-trainer/:email", async (req, res) => {
  try {
      const { email } = req.params;

      // ✅ Check if the email exists in the trainers collection
      const trainer = await Trainer.findOne({ email });

      if (!trainer) {
          return res.status(404).json({ success: false, message: "Trainer not found" });
      }

      res.json({ success: true, message: "Trainer is registered", user: trainer });

  } catch (error) {
      console.error("❌ Error checking trainer:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
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
    res.json({ success: true, record: newRecord, message: 'clocked in' });
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

    // Check if there's an active clock-in for today
    const record = await TrainerAttendance.findOneAndUpdate(
      { email, date: today, clockOut: null },
      { $set: { clockOut: new Date() } },
      { new: true }
    );
    if (!record) return res.status(404).json({ success: false, message: "No active clock-in found for this trainer today" });
    res.json({ success: true, record, message: "Trainer clocked out successfully", time: record.clockOut });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/check-trainer/:email", async (req, res) => {
  try {
      const { email } = req.params;
      const trainer = await Trainer.findOne({ email });
      res.json({ exists: !!trainer, name: trainer? trainer.name : null });
  } catch (error) {
      console.error("Error fetching trainer:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/check-registration/:email", async (req, res) => {
  try {
      const { email } = req.params;
      const user = await Registration.findOne({ email });
      res.json({ exists: !!user, name: user ? user.name : null });
  } catch (error) {
      console.error("Error fetching member:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/api/attendance/members", async (req, res) => {
  try {
      const attendance = await Attendance.find();
      res.json(attendance);
  } catch (error) {
      console.error("Error fetching attendance records:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Fetch All Trainer Attendance Records (from "trainer_attendance")
app.get("/api/attendance/trainers", async (req, res) => {
  try {
      const attendance = await TrainerAttendance.find();
      res.json(attendance);
  } catch (error) {
      console.error("Error fetching trainer attendance records:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/enquiries-per-month/:year", async (req, res) => {
  const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  const year = parseInt(req.params.year);

  if (isNaN(year) || year < 2000 || year > new Date().getFullYear()) {
    return res.status(400).json({ error: "Invalid year provided." });
  }

  try {
    const result = await Enquiry.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formattedResult = MONTHS.map((month, index) => ({
      month,
      enquiries: result.find(r => r._id === index + 1)?.count || 0
    }));

    res.json({ year, data: formattedResult });
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/api/gender-ratio', async (req, res) => {
  try {
    const result = await Registration.aggregate([
      { 
        $group: { 
          _id: "$gender", 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Convert aggregation result to a usable format
    const counts = { Male: 0, Female: 0, Other: 0 };
    result.forEach(({ _id, count }) => {
      counts[_id] = count;
    });

    const total = counts.Male + counts.Female;
    const maleRatio = total > 0 ? (counts.Male / total) * 100 : 0;
    const femaleRatio = total > 0 ? (counts.Female / total) * 100 : 0;

    res.json({
      success: true,
      data: {
        Male: counts.Male,
        Female: counts.Female,
        Other: counts.Other,
        MalePercentage: `${maleRatio.toFixed(2)}%`,
        FemalePercentage: `${femaleRatio.toFixed(2)}%`
      }
    });
  } catch (err) {
    console.error("❌ Trainer Clock-Out Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
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

// ✅ GET Last Week Attendance Report (Optimized)
// ✅ GET Last Week Attendance Report (Using string dates)
// GET Last Week Marked Attendance Report
app.get('/api/attendance/last-week-marked', async (req, res) => {
  try {
    // Generate an array of the last 7 days as strings "YYYY-MM-DD"
    const today = new Date();
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    
    // Match records based on markedAt date range
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[dates.length - 1]);
    endDate.setHours(23, 59, 59, 999);
    
    const markedData = await MarkedAttendance.aggregate([
      { $match: { markedAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$markedAt" } }, count: { $sum: 1 } } }
    ]);
    
    const markedCounts = dates.map(date => {
      const found = markedData.find(item => item._id === date);
      return found ? found.count : 0;
    });
    
    res.json({ dates, markedCounts });
  } catch (err) {
    console.error("❌ Error fetching last week marked attendance:", err);
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

app.delete('/api/trainerAttendances/:id', (req, res) => {
  TrainerAttendance.findByIdAndDelete(req.params.id)
    .then(() => res.json({ success: true }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});
app.delete('/api/memberAttendances/:id', (req, res) => {
  MemberAttendance.findByIdAndDelete(req.params.id)
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

// ✅ Check if Member is Registered (For Attendance)
app.get('/api/check-registration/:email', async (req, res) => {
  try {
      const email = req.params.email;
      const user = await Registration.findOne({ email });

      if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
      }

      res.json({ success: true, user });
  } catch (error) {
      console.error("❌ Error checking registration:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
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
// ✅ Check if email credentials exist
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ EMAIL_USER or EMAIL_PASS is missing in .env file!");
    process.exit(1);
}


// ✅ Registration Route
app.post("/register", async (req, res) => {
    try {
        console.log("📩 Received Registration Data:", req.body);
        const { gender, name, packageStartDate, contactNo, email, plans, height, weight, timeSlot } = req.body;

        // ✅ Validate Required Fields
        if (!gender || !name || !packageStartDate || !contactNo || !email || !plans || !height || !weight || !timeSlot) {
            console.error("❌ Missing required fields!");
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        // ✅ Save to MongoDB
        const newRegistration = new Registration(req.body);
        await newRegistration.save();
        console.log("✅ Data saved to 'registrations' collection in MongoDB");

        // ✅ Ensure "bills" folder exists
        const billsDir = "./bills";
        if (!fs.existsSync(billsDir)) {
            fs.mkdirSync(billsDir);
            console.log("📂 'bills' folder created");
        }

        // ✅ Generate PDF Receipt
        const pdfPath = `${billsDir}/${email}_${Date.now()}_receipt.pdf`;
        const doc = new PDFDocument();
        const pdfStream = fs.createWriteStream(pdfPath);
        doc.pipe(pdfStream);

        // ✅ Add Renewal Link
        const renewLink = `http://localhost:5500/Register222.html?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&contactNo=${encodeURIComponent(contactNo)}&plans=${encodeURIComponent(plans)}&height=${encodeURIComponent(height)}&weight=${encodeURIComponent(weight)}&timeSlot=${encodeURIComponent(timeSlot)}&packageStartDate=${encodeURIComponent(packageStartDate)}&gender=${encodeURIComponent(gender)}`;

        doc.fontSize(18).text("Minnat Vigour Gym - Registration Receipt", { align: "center" });
        doc.moveDown();
        doc.fontSize(14).text(`Name: ${name}`);
        doc.text(`Email: ${email}`);
        doc.text(`Contact: ${contactNo}`);
        doc.text(`Plan: ₹${plans}`);
        doc.text(`Height: ${height} cm`);
        doc.text(`Weight: ${weight} kg`);
        doc.text(`Time Slot: ${timeSlot}`);
        doc.text(`Package Start Date: ${packageStartDate}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
          },
      });
        
        doc.fillColor("blue").text("Renew Membership", { link: renewLink, underline: true });

        doc.end();

        pdfStream.on("finish", async () => {
            console.log("✅ PDF Generated:", pdfPath);

            // ✅ Send Email with PDF
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email, 
                subject: "Gym Registration Confirmation",
                text: "Thank you for registering at Minnat Vigour Gym. Your payment receipt is attached.",
                attachments: [{ filename: "receipt.pdf", path: pdfPath }],
            };

            try {
                const info = await transporter.sendMail(mailOptions);
                console.log("📧 Email sent successfully:", info.response);
                res.json({ success: true, message: "Registration successful! Receipt sent to email." });
            } catch (emailError) {
                console.error("❌ Email Sending Error:", emailError);
                res.status(500).json({ success: false, message: "Registration successful, but email sending failed." });
            }
        });

    } catch (error) {
        console.error("❌ Registration Error:", error);
        res.status(500).json({ success: false, message: "Successfully Registered" });
    }
});
// ✅ Fetch All Registrations
app.get("/api/registrations", async (req, res) => {
  try {
      const registrations = await Registration.find(); // Fetch all registered members
      res.json({ success: true, data: registrations }); // Return as an array inside 'data'
  } catch (error) {
      console.error("❌ Error fetching registrations:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
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
// Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ API to Track Weight (Fixed Email Matching)
app.post("/weight-track", async (req, res) => {
  try {
    let { emailID, currentWeight, targetWeight, timePeriod } = req.body;

    // Normalize email (trim spaces, convert to lowercase)
    emailID = emailID.trim().toLowerCase();

    console.log(`🔍 Checking registration for: ${emailID}`);

    // 🔍 Fix: Check `email` field in registrations collection
    const isRegistered = await Registration.findOne({ email: emailID });

    if (!isRegistered) {
      console.log(`❌ Member not found: ${emailID}`);
      return res.status(400).json({ message: "❌ Member does not exist. Please register first." });
    }

    console.log(`✅ Member found: ${emailID}`);

    // ✅ Save Weight Data
    const newWeight = new Weight({ emailID, currentWeight, targetWeight, timePeriod });
    await newWeight.save();

    console.log(`✅ Weight data saved for: ${emailID}`);

    // Generate PDF
    const pdfFilePath = `./weight_track_${Date.now()}.pdf`;
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfFilePath);

    doc.pipe(writeStream);
    doc.fontSize(18).text("Weight Tracking Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Email ID: ${emailID}`);
    doc.text(`Current Weight: ${currentWeight} kg`);
    doc.text(`Target Weight: ${targetWeight} kg`);
    doc.text(`Measurement Interval: ${timePeriod}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.end();

    writeStream.on("finish", async () => {
      // Send Email with PDF Attachment
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emailID,
        subject: "Your Weight Tracking Report",
        text: "Attached is your weight tracking record.",
        attachments: [{ filename: "Weight_Tracking_Report.pdf", path: pdfFilePath }],
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("📩 Email sent successfully!");
        fs.unlinkSync(pdfFilePath); // Delete file after sending
        res.status(201).json({ message: "✅ Weight tracked successfully! PDF sent to email." });
      } catch (emailError) {
        console.error("❌ Email sending failed:", emailError);
        res.status(500).json({ message: "Weight tracked, but email sending failed." });
      }
    });
  } catch (error) {
    console.error("❌ Error saving weight:", error);
    res.status(500).json({ message: "✅ Weight tracked successfully! PDF sent to email."});
  }
});

// ✅ API to Fetch Weight History by Email
app.get("/weight-history/:emailID", async (req, res) => {
  try {
    let emailID = req.params.emailID.trim().toLowerCase();

    const history = await Weight.find({ emailID }).sort({ createdDate: -1 });

    if (!history.length) {
      return res.status(404).json({ message: "No past records found." });
    }

    res.status(200).json(history);
  } catch (error) {
    console.error("❌ Error fetching history:", error);
    res.status(500).json({ message: "Failed to fetch weight history." });
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
//feedback api get
app.get('/api/check-member', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    // Ensure you're querying the correct 'registrations' collection
    const user = await Registration.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User does not exist. Only members can give feedback." });
    }

    res.status(200).json({ success: true, message: "User is a registered member." });

  } catch (error) {
    console.error("Error checking membership:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

// Feedback Endpoint with PDF attachment
app.post('/api/feedback', async (req, res) => {
  try {
    console.log("Feedback received:", req.body);

    const { firstName, lastName, email, cleanlinessRating, equipmentRating, trainerRating, comments } = req.body;

    // Save feedback to MongoDB
    const feedback = new Feedback({ firstName, lastName, email, cleanlinessRating, equipmentRating, trainerRating, comments });
    await feedback.save();
    console.log("Feedback saved to database");

    // Generate PDF
    const pdfPath = path.join(__dirname, `feedback_${Date.now()}.pdf`);
    const doc = new PDFDocument();
    const pdfStream = fs.createWriteStream(pdfPath);

    doc.pipe(pdfStream);
    doc.fontSize(16).text("Feedback Details", { align: "center" }).moveDown();
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
      console.log("PDF generated successfully:", pdfPath);

      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("Email credentials are missing in .env file");
        return res.status(500).json({ success: false, message: "Email credentials missing." });
      }

      // Email setup
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
        attachments: [{ filename: "feedback.pdf", path: pdfPath, contentType: "application/pdf" }]
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");

        // Delete the PDF after sending the email
        fs.unlink(pdfPath, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting feedback PDF:", unlinkErr);
          else console.log("PDF deleted successfully");
        });

        return res.status(200).json({ success: true, message: "Feedback submitted and details sent via email." });

      } catch (emailError) {
        console.error("Error sending email:", emailError);
        return res.status(500).json({ success: false, message: "Feedback submitted but email sending failed.", error: emailError.message });
      }
    });

    pdfStream.on("error", (err) => {
      console.error("Error generating PDF:", err);
      return res.status(500).json({ success: false, message: "Error generating PDF." });
    });

  } catch (error) {
    console.error("Server error submitting feedback:", error);
    return res.status(500).json({ success: false, message: "Server error submitting feedback.", error: error.message });
  }
});

// Fetch all feedbacks from the database
router.get('/api/feedbacks', async (req, res) => {
  try {
    const feedbacks = await Feedback.find(); // Fetch all feedback entries
    res.status(200).json(feedbacks); // Send JSON response
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ message: 'Error fetching feedbacks', error: error.message });
  }
});

module.exports = router;


/***************************************
 * START SERVER
 ***************************************/
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`); // Port changed to 5000
});
