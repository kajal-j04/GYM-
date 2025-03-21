const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/minnat_vigour_gym", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Connection Failed:", err));

// -----------------------
// Define Schemas and Models
// -----------------------

// Member registration schema
const registrationSchema = new mongoose.Schema({
    name: String,
    email: String,
    contactNo: String,
    plans: String,
    height: Number,
    weight: Number,
    timeSlot: String,
    date: Date
});
const Registration = mongoose.model("Registration", registrationSchema, "registrations");

// Trainer schema
const trainerSchema = new mongoose.Schema({
    name: String,
    email: String,
    specialization: String,
    phone: String,
    experience: String,
    imageName: String
});
const Trainer = mongoose.model("Trainer", trainerSchema, "trainers");

// ✅ Member Attendance Schema (Stored in "attendance")
const attendanceSchema = new mongoose.Schema({
    email: { type: String, required: true },
    date: { type: String, required: true },
    clockIn: { type: String, required: true },
    clockOut: { type: String }
});
const Attendance = mongoose.model("Attendance", attendanceSchema, "attendance");

// ✅ Trainer Attendance Schema (Stored in "trainer_attendance")
const trainerAttendanceSchema = new mongoose.Schema({
    email: { type: String, required: true },
    date: { type: String, required: true },
    clockIn: { type: String, required: true },
    clockOut: { type: String }
});
const TrainerAttendance = mongoose.model("TrainerAttendance", trainerAttendanceSchema, "trainer_attendance");

// -----------------------
// API Endpoints
// -----------------------

// ✅ Check if Member Exists
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

// ✅ Member Clock In (Stored in "attendance")
app.post("/api/attendance/clock-in", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const date = new Date().toISOString().split("T")[0];
        const existingRecord = await Attendance.findOne({ email, date });

        if (existingRecord) {
            return res.status(400).json({ message: "Already clocked in today" });
        }

        const newAttendance = new Attendance({ email, date, clockIn: new Date().toISOString() });
        await newAttendance.save();
        res.json({ message: "Clocked in successfully", time: newAttendance.clockIn });
    } catch (error) {
        console.error("Member Clock-in Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Member Clock Out
app.post("/api/attendance/clock-out", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const date = new Date().toISOString().split("T")[0];
        const attendance = await Attendance.findOne({ email, date });

        if (!attendance) return res.status(400).json({ message: "No clock-in record found for today" });
        if (attendance.clockOut) return res.status(400).json({ message: "Already clocked out today" });

        attendance.clockOut = new Date().toISOString();
        await attendance.save();
        res.json({ message: "Clocked out successfully", time: attendance.clockOut });
    } catch (error) {
        console.error("Member Clock-out Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Check if Trainer Exists
app.get("/api/check-trainer/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const trainer = await Trainer.findOne({ email });
        res.json({ exists: !!trainer, name: trainer ? trainer.name : null });
    } catch (error) {
        console.error("Error fetching trainer:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Trainer Clock In (Stored in "trainer_attendance")
app.post("/api/attendance/trainer-clock-in", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const date = new Date().toISOString().split("T")[0];
        const existingRecord = await TrainerAttendance.findOne({ email, date });

        if (existingRecord) {
            return res.status(400).json({ message: "Already clocked in today" });
        }

        const newRecord = new TrainerAttendance({ email, date, clockIn: new Date().toISOString() });
        await newRecord.save();
        res.json({ message: "Trainer clocked in successfully", time: newRecord.clockIn });
    } catch (error) {
        console.error("Trainer Clock-in Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Trainer Clock Out
app.post("/api/attendance/trainer-clock-out", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const date = new Date().toISOString().split("T")[0];
        const record = await TrainerAttendance.findOne({ email, date });

        if (!record) return res.status(400).json({ message: "No clock-in record found for today" });
        if (record.clockOut) return res.status(400).json({ message: "Already clocked out today" });

        record.clockOut = new Date().toISOString();
        await record.save();
        res.json({ message: "Trainer clocked out successfully", time: record.clockOut });
    } catch (error) {
        console.error("Trainer Clock-out Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Fetch All Member Attendance Records (from "attendance")
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

// -----------------------
// Start Server
// -----------------------
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
