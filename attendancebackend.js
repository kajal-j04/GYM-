const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// Initialize App
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/minnat_vigour_gym", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Connection Failed:", err));

// Define Schemas
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

const attendanceSchema = new mongoose.Schema({
    email: { type: String, required: true },
    date: { type: String, required: true },
    clockIn: { type: String, required: true },
    clockOut: { type: String }
});
const Attendance = mongoose.model("Attendance", attendanceSchema, "attendance");

// ✅ **API: Check if User Exists**
app.get("/api/check-registration/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const user = await Registration.findOne({ email: email });

        if (user) {
            res.json({ exists: true, name: user.name });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ **API: Get Attendance Status**
app.get("/api/attendance/status/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const date = new Date().toISOString().split("T")[0]; // Current date

        const attendance = await Attendance.findOne({ email, date });

        if (!attendance) return res.json({ clockIn: null, clockOut: null });

        res.json({ clockIn: attendance.clockIn, clockOut: attendance.clockOut });
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ **API: Clock In**
app.post("/api/attendance/clock-in", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const date = new Date().toISOString().split("T")[0];

        const existingRecord = await Attendance.findOne({ email, date });

        if (existingRecord) return res.status(400).json({ message: "Already clocked in today" });

        const newAttendance = new Attendance({ email, date, clockIn: new Date().toISOString() });
        await newAttendance.save();
        res.json({ message: "Clocked in successfully", time: newAttendance.clockIn });
    } catch (error) {
        console.error("Clock-in Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ **API: Clock Out**
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
        console.error("Clock-out Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ **Start Server**
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
