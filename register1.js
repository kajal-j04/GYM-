require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ MongoDB Connection
mongoose.connect("mongodb://localhost:27017/minnat_vigour_gym", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Schema for Registration (Ensures Collection Name is "registrations")
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

const Registration = mongoose.model("registrations", registrationSchema, "registrations"); // Explicit collection name

// ✅ Check Environment Variables for Email
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ EMAIL_USER or EMAIL_PASS is missing in .env file!");
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ✅ Registration Route
app.post("/register", async (req, res) => {
    try {
        const userData = req.body;
        console.log("📩 Received Data:", userData);

        // ✅ Save to MongoDB (Ensures using correct collection)
        const newRegistration = new Registration(userData);
        await newRegistration.save();
        console.log("✅ Data saved to 'registrations' collection in MongoDB");

        // ✅ Ensure `bills/` folder exists before creating the PDF
        const billsDir = "./bills";
        if (!fs.existsSync(billsDir)) {
            fs.mkdirSync(billsDir);
            console.log("📂 'bills' folder created");
        }

        // ✅ Generate PDF Receipt
        const pdfPath = `${billsDir}/${userData.email}_receipt.pdf`;
        const doc = new PDFDocument();
        const pdfStream = fs.createWriteStream(pdfPath);
        doc.pipe(pdfStream);

        doc.fontSize(18).text("Minnat Vigour Gym - Registration Receipt", { align: "center" });
        doc.moveDown();
        doc.fontSize(14).text(`Name: ${userData.name}`);
        doc.text(`Email: ${userData.email}`);
        doc.text(`Contact: ${userData.contactNo}`);
        doc.text(`Plan: ₹${userData.plans}`);
        doc.text(`Height: ${userData.height} cm`);
        doc.text(`Weight: ${userData.weight} kg`);
        doc.text(`Time Slot: ${userData.timeSlot}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.end();

        pdfStream.on("finish", async () => {
            console.log("✅ PDF Generated:", pdfPath);

            // ✅ Send Email with Receipt
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: userData.email,
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
        res.status(500).json({ success: false, message: "Registration failed. Please try again later." });
    }
});

// ✅ Fetch All Registrations (Ensure Correct Collection Name)
app.get("/api/registrations", async (req, res) => {
    try {
        const registrations = await Registration.find();
        res.json(registrations);
    } catch (error) {
        console.error("❌ Error fetching data:", error);
        res.status(500).json({ success: false, message: "Error fetching data." });
    }
});

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
