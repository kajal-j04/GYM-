const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const { GridFSBucket } = require('mongodb');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/minnat_vigour_gym', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Mongoose Schema
const userSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    phoneNo: { type: Number, unique: true },
    date: String
});
const registrationSchema = new mongoose.Schema({
    memberId: { type: String, required: true },
    gender: { type: String, required: true },
    name: { type: String, required: true },
    dob: { type: String, required: true },
    contactNo: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    plans: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    timeSlot: { type: String, required: true },
});
const scheduleSchema = new mongoose.Schema({
    classId: { type: Number, unique: false },
    className: { type: String, unique: false },
    trainerId: { type: Number },
    maxCapacity: Number,
    schedule: String
});
const MemberSchema = new mongoose.Schema({
    memberId: String,
    gender: String,
    name: { type: String, required: true },
    dob: String,
    contactNo: { type: String, minlength: 10, maxlength: 10, required: true },
    email: { type: String, required: true, unique: true },
    fullAddress: String,
    plans: String,
    totalAmount: Number,
    height: Number,
    weight: Number,
    timeSlot: String
});
const staffSchema = new mongoose.Schema({ 
    staffId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    dob: { type: Date, required: true },
    contactNo: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gender: { type: String, required: true },
    salary: { type: Number, required: true },
    workingSkill: { type: String, required: true },
    fullAddress: { type: String, required: true }
});

const feedbackSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    cleanlinessRating: { type: Number, required: true },
    equipmentRating: { type: Number, required: true },
    trainerRating: { type: Number, required: true },
    comments: { type: String }
});
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
const User = mongoose.model('User', userSchema);
const Schedule = mongoose.model('Schedule', scheduleSchema);
const Staff = mongoose.model('Staff', staffSchema);
const Feedback = mongoose.model("Feedback", feedbackSchema);
const Registration = mongoose.model('Registration', registrationSchema);
const Member = mongoose.model("Member", MemberSchema);
// Define Schema & Model


// Routes
app.post('/signup', async (req, res) => {
    const { name, email, password, confirmPassword, phoneNo, date } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match!' });
    }

    try {
        const user = new User({ name, email, password, phoneNo, date });
        const isEmailPresent = await User.findOne({ email: email })
        const isNamePresent = await User.findOne({ name })
        const isNoPresent = await User.findOne({ phoneNo })
        if (isEmailPresent) {
            res.status(400).json({ message: 'Email already exists.' });
            return;
        }
        if (isNamePresent) {
            res.status(400).json({ message: 'Name already exists.' });
            return;
        }
        if (isNoPresent) {
            res.status(400).json({ message: 'Phone No already exists.' });
            return;
        }
        await user.save();
        res.status(200).json({ message: 'Signup successful!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error signing up!' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, password });
        if (user) {
            res.status(200).json({ message: 'Login successful!' });
        } else {
            res.status(400).json({ message: 'Invalid email or password!' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error logging in!' });
    }
});

app.post('', async(req,res) => {
    const {  } = req.body; // take data into varialble from req body
})

//to be used in html js to call backeng
// fetch('http://localhost:3000/', {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({jsObject}),
// })

app.post('/schedule', async(req,res) => {

    const { classId, className, trainerId, schedule, maxCapacity } = req.body; // classId,className etc... the key should be same as what you are passing from html/js

    try {
        const sc = new Schedule({ classId, className, trainerId, schedule, maxCapacity });
        await sc.save();
        res.status(200).json({ message: 'Schedule confirmed!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error logging in!' });
    }
})

app.post('/staff', async(req,res) => {
    try {
        const existingStaff = await Staff.findOne({ staffId: req.body.staffId });
        if (existingStaff) return res.status(400).json({ error: "Staff ID already exists!" });

        const existingEmail = await Staff.findOne({ email: req.body.email });
        if (existingEmail) return res.status(400).json({ error: "Email already exists!" });

        const newStaff = new Staff(req.body);
        await newStaff.save();
        res.status(201).json({ message: "Staff registered successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error Adding staff in!' });
    }
})

app.post("/feedback", async (req, res) => {
    try {
        console.log("📥 Feedback received:", req.body);
        const feedback = new Feedback(req.body)
        await feedback.save(); // ✅ Save the feedback
        console.log("✅ Feedback saved successfully!");
        res.status(201).json({ message: "Thank you for your feedback!" });

    } catch (err) {
        console.error("❌ Error submitting feedback:", err);
        res.status(500).json({ message: "Error submitting feedback!" });
    }
});
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
// Register API
app.post("/register222", async (req, res) => {
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
    console.log(`Server is running on http://localhost:${PORT}`);
});
