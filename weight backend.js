require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Define Weight Schema
const weightSchema = new mongoose.Schema({
    memberId: { type: String, required: true },
    weightGain: { type: Number, default: 0 },
    weightLoss: { type: Number, default: 0 },
    previousWeight: { type: Number, required: true },
    createdDate: { type: Date, required: true },
});

// Create Model
const Weight = mongoose.model("Weight", weightSchema);

// 📌 API Route to Track Weight
app.post("/track-weight", async (req, res) => {
    try {
        const { memberId, weightGain, weightLoss, previousWeight, createdDate } = req.body;

        // Validate required fields
        if (!memberId || !previousWeight || !createdDate) {
            return res.status(400).json({ message: "Member ID, Previous Weight, and Created Date are required." });
        }

        // Create a new weight tracking entry
        const newWeight = new Weight({
            memberId,
            weightGain: weightGain || 0,
            weightLoss: weightLoss || 0,
            previousWeight,
            createdDate,
        });

        // Save to database
        await newWeight.save();
        res.status(201).json({ message: "Weight tracked successfully!", data: newWeight });
    } catch (error) {
        console.error("Error saving weight:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

// 📌 API Route to Get All Weight Records
app.get("/weight-records", async (req, res) => {
    try {
        const records = await Weight.find();
        res.status(200).json(records);
    } catch (error) {
        console.error("Error fetching records:", error);
        res.status(500).json({ message: "Failed to fetch weight records." });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
