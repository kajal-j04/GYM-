const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/minnat_vigour_gym", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Define Schema & Model
const scheduleSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  workoutDays: [String], // Checkboxes (Preferred Workout Days)
  timeSlot: String, // Dropdown (Preferred Time Slot)
  workoutType: [String], // Checkboxes (Workout Type)
  duration: String, // Dropdown (Duration per Session)
  goal: String, // Dropdown (Primary Goal)
  sessionType: String, // Radio Button (Group or Individual)
});

const Schedule = mongoose.model("Schedules", scheduleSchema);

// API Endpoint to Handle Form Submission
app.post("/schedule", async (req, res) => {
  try {
    const { name, email, phone, workoutDays, timeSlot, workoutType, duration, goal, sessionType } = req.body;

    const newSchedule = new Schedule({
      name,
      email,
      phone,
      workoutDays,
      timeSlot,
      workoutType,
      duration,
      goal,
      sessionType,
    });

    await newSchedule.save();
    res.status(201).json({ message: "Schedule saved successfully" });
  } catch (error) {
    console.error("Error saving schedule:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
