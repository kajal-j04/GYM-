require("dotenv").config();
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// Load environment variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Verify credentials
console.log("EMAIL_USER:", EMAIL_USER);
console.log("EMAIL_PASS:", EMAIL_PASS ? "Exists" : "Missing");

// Check if PDF file exists
const pdfPath = path.join(__dirname, "pdfs", "test.pdf");
if (!fs.existsSync(pdfPath)) {
    console.error("❌ File does NOT exist:", pdfPath);
    process.exit(1);
} else {
    console.log("✅ PDF File exists:", pdfPath);
}

// Setup transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

// Email options
const mailOptions = {
    from: EMAIL_USER,
    to: "recipient@example.com", // Change this to your test email
    subject: "Test Email with PDF",
    text: "Here is your PDF file.",
    attachments: [
        {
            filename: "test.pdf",
            path: pdfPath,
        },
    ],
};

// Send email
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error("❌ Error sending email:", error);
    } else {
        console.log("✅ Email sent:", info.response);
    }
});
