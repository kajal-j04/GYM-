require("dotenv").config();
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
app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/minnat_vigour_gym", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Define Schema (Using packageStartDate instead of dob)
const registrationSchema = new mongoose.Schema({
    gender: { type: String, required: true },
    name: { type: String, required: true },
    packageStartDate: { type: String, required: true }, // Updated field
    contactNo: { type: String, required: true },
    email: { type: String, required: true },
    plans: { type: String, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    timeSlot: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Registration = mongoose.model("registrations", registrationSchema, "registrations");

// ✅ Check if email credentials exist
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ EMAIL_USER or EMAIL_PASS is missing in .env file!");
    process.exit(1);
}

// ✅ Nodemailer Transporter
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
        res.status(500).json({ success: false, message: "Registration failed. Please try again later." });
    }
});

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
