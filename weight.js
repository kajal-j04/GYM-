require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");

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

// Schema for Registrations (Fixing field name)
const registrationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // ✅ Match stored field name
});

const Registration = mongoose.model("registrations", registrationSchema);

// Schema for Weight Tracking
const weightSchema = new mongoose.Schema({
  emailID: { type: String, required: true },
  currentWeight: { type: Number, required: true },
  targetWeight: { type: Number, required: true },
  timePeriod: { type: String, required: true },
  createdDate: { type: Date, default: Date.now },
});

const Weight = mongoose.model("weight_track", weightSchema);

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ API to Track Weight (Fixed Email Matching)
app.post("/weight-track", async (req, res) => {
  try {
    let { emailID, currentWeight, targetWeight, timePeriod } = req.body;

    // Normalize email (trim spaces, convert to lowercase)
    emailID = emailID.trim().toLowerCase();

    console.log(`🔍 Checking registration for: ${emailID}`);

    // 🔍 Fix: Check `email` field in registrations collection
    const isRegistered = await Registration.findOne({ email: emailID });

    if (!isRegistered) {
      console.log(`❌ Member not found: ${emailID}`);
      return res.status(400).json({ message: "❌ Member does not exist. Please register first." });
    }

    console.log(`✅ Member found: ${emailID}`);

    // ✅ Save Weight Data
    const newWeight = new Weight({ emailID, currentWeight, targetWeight, timePeriod });
    await newWeight.save();

    console.log(`✅ Weight data saved for: ${emailID}`);

    // Generate PDF
    const pdfFilePath = `./weight_track_${Date.now()}.pdf`;
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfFilePath);

    doc.pipe(writeStream);
    doc.fontSize(18).text("Weight Tracking Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Email ID: ${emailID}`);
    doc.text(`Current Weight: ${currentWeight} kg`);
    doc.text(`Target Weight: ${targetWeight} kg`);
    doc.text(`Measurement Interval: ${timePeriod}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.end();

    writeStream.on("finish", async () => {
      // Send Email with PDF Attachment
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emailID,
        subject: "Your Weight Tracking Report",
        text: "Attached is your weight tracking record.",
        attachments: [{ filename: "Weight_Tracking_Report.pdf", path: pdfFilePath }],
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("📩 Email sent successfully!");
        fs.unlinkSync(pdfFilePath); // Delete file after sending
        res.status(201).json({ message: "✅ Weight tracked successfully! PDF sent to email." });
      } catch (emailError) {
        console.error("❌ Email sending failed:", emailError);
        res.status(500).json({ message: "Weight tracked, but email sending failed." });
      }
    });
  } catch (error) {
    console.error("❌ Error saving weight:", error);
    res.status(500).json({ message: "✅ Weight tracked successfully! PDF sent to email."});
  }
});

// ✅ API to Fetch Weight History by Email
app.get("/weight-history/:emailID", async (req, res) => {
  try {
    let emailID = req.params.emailID.trim().toLowerCase();

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
