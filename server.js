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
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/minnat_vigour_gym', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Mongoose Schemas
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
    classId: { type: Number },
    className: { type: String },
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
const weightSchema = new mongoose.Schema({
    memberId: { type: String, required: true },
    weightGain: { type: Number, default: 0 },
    weightLoss: { type: Number, default: 0 },
    previousWeight: { type: Number, required: true },
    createdDate: { type: Date, required: true },
});
const enquirySchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    message: String,
    createdAt: { type: Date, default: Date.now },
});

// Create Models
const Weight = mongoose.model("Weight", weightSchema);
const User = mongoose.model('User', userSchema);
const Schedule = mongoose.model('Schedule', scheduleSchema);
const Staff = mongoose.model('Staff', staffSchema);
const Feedback = mongoose.model("Feedback", feedbackSchema);
const Registration = mongoose.model('Registration', registrationSchema);
const Member = mongoose.model("Member", MemberSchema);
const Enquiry = mongoose.model("Enquiry", enquirySchema);

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

// Enquiry APIs
app.post("/enquiry", async (req, res) => {
    try {
        const newEnquiry = new Enquiry(req.body);
        await newEnquiry.save();
        res.status(201).json({ 
            message: "Enquiry submitted successfully!", 
            redirect: "/dashboard" // URL to redirect
        });
    } catch (error) {
        res.status(500).json({ error: "Error submitting enquiry" });
    }
});

app.get("/enquiries", async (req, res) => {
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (error) {
        res.status(500).json({ error: "Error fetching enquiries" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
