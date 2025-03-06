const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/minnat_vigour_gym", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const weightSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  emailID: { type: String, required: true },
  currentWeight: { type: Number, required: true },
  targetWeight: { type: Number, required: true },
  timePeriod: { type: String, required: true },
  createdDate: { type: Date, default: Date.now },
});

const Weight = mongoose.model("weight track", weightSchema);

// API to Track Weight
app.post("/weight-track", async (req, res) => {
  try {
    const { fullName, emailID, currentWeight, targetWeight, timePeriod } = req.body;

    if (!fullName || fullName.length < 3) {
      return res.status(400).json({ message: "Full Name must be at least 3 characters." });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailID)) {
      return res.status(400).json({ message: "Invalid Email format." });
    }

    if (!currentWeight || currentWeight <= 0) {
      return res.status(400).json({ message: "Current Weight must be greater than 0." });
    }

    if (!targetWeight || targetWeight <= 0) {
      return res.status(400).json({ message: "Target Weight must be greater than 0." });
    }

    if (!timePeriod) {
      return res.status(400).json({ message: "Time Period is required." });
    }

    const newWeight = new Weight({ fullName, emailID, currentWeight, targetWeight, timePeriod });

    await newWeight.save();
    res.status(201).json({ message: "✅ Weight tracked successfully!", data: newWeight });
  } catch (error) {
    console.error("❌ Error saving weight:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// 📌 New API Route: Fetch Weight History for a User
app.get("/weight-history/:emailID", async (req, res) => {
  try {
    const emailID = req.params.emailID;
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
