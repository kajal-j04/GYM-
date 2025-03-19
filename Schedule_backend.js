require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Correct Database Connection
mongoose.connect("mongodb://127.0.0.1:27017/minnat_vigour_gym", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB: minnat_vigour_gym"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Explicitly Define Collection Name
const scheduleSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    timeSlot: String,
    duration: String,
    goal: String,
    sessionType: String,
    workoutType: [String],
    workoutDays: [String],
}, { collection: "schedules" }); // 👈 Ensures it maps to `schedules`

const Schedule = mongoose.model("Schedule", scheduleSchema);

// ✅ Nodemailer Configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER || "chawdharysaima@gmail.com",
        pass: process.env.EMAIL_PASS || "clfsbcxacurxvycu"
    },
});

// ✅ Function to Create PDF
const createPDF = (scheduleData) => {
    return new Promise((resolve, reject) => {
        const fileName = `schedule_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, fileName);
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);
        doc.fontSize(20).text("Gym Schedule Confirmation", { align: "center" }).moveDown(1);
        doc.fontSize(14).text(`Name: ${scheduleData.name}`);
        doc.text(`Email: ${scheduleData.email}`);
        doc.text(`Phone: ${scheduleData.phone}`);
        doc.text(`Time Slot: ${scheduleData.timeSlot}`);
        doc.text(`Duration: ${scheduleData.duration}`);
        doc.text(`Goal: ${scheduleData.goal}`);
        doc.text(`Session Type: ${scheduleData.sessionType}`);
        doc.text(`Workout Type: ${scheduleData.workoutType.join(", ")}`);
        doc.text(`Workout Days: ${scheduleData.workoutDays.join(", ")}`);
        doc.end();

        stream.on("finish", () => resolve(filePath));
        stream.on("error", (error) => reject(error));
    });
};

// ✅ Route to Handle Schedule Submission
app.post("/schedule", async (req, res) => {
    try {
        console.log("📩 Received schedule request:", req.body);

        const { name, email, phone, timeSlot, duration, goal, sessionType, workoutType, workoutDays } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({ message: "❌ Missing required fields" });
        }

        // ✅ Save to MongoDB `schedules` Collection
        const newSchedule = new Schedule({ name, email, phone, timeSlot, duration, goal, sessionType, workoutType, workoutDays });
        await newSchedule.save();

        const pdfPath = await createPDF(newSchedule);

        // ✅ Updated MailOptions
        const mailOptions = {
            from: `"Minnat Vigour Gym" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "📅 Your Gym Schedule Confirmation",
            text: `Hello ${name},\n\nThank you for scheduling your gym session with us. Attached is your confirmation.\n\nBest Regards,\nMinnat Vigour Gym 🏋️‍♂️`,
            attachments: [
                {
                    filename: "Gym_Schedule.pdf",
                    path: pdfPath,
                    contentType: "application/pdf",
                },
            ],
        };

        // ✅ Send Email with PDF
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("❌ Email sending failed:", err);
                return res.status(500).json({ message: "❌ Email sending failed", error: err.message });
            }
            console.log("✅ Email sent successfully:", info.response);

            // ✅ Delete PDF After Sending
            fs.unlink(pdfPath, (unlinkErr) => {
                if (unlinkErr) console.error("⚠️ Error deleting PDF:", unlinkErr);
                else console.log("✅ PDF deleted successfully:", pdfPath);
            });

            res.status(200).json({ message: "✅ Schedule created and email with PDF sent successfully!" });
        });
    } catch (error) {
        console.error("❌ Error processing request:", error);
        res.status(500).json({ message: "❌ Server error. Try again!", error: error.message });
    }
});

// ✅ Start Express Server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
