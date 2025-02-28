const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/minnat_vigour_gym", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("Error connecting to MongoDB:", err));

// Schema and Model
const registrationSchema = new mongoose.Schema({
    memberId: String,
    gender: String,
    name: String,
    dob: String,
    contactNo: String,
    email: String,
    address: String,
    plans: String,
    totalAmount: Number,
    height: Number,
    weight: Number,
    timeSlot: String,
});

const Registration = mongoose.model("registration", registrationSchema);

// API Route to handle registration
app.post("/register", async (req, res) => {
    try {
        const newRegistration = new Registration(req.body);
        await newRegistration.save();
        res.status(201).json({ message: "Registration successful!" });
    } catch (error) {
        res.status(500).json({ message: "Error saving registration data", error });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
