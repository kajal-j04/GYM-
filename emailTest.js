require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "chawdharyzubair@gmail.com",
    subject: "Test Email",
    text: "This is a test email from your Gym Management System."
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error("Email Sending Error:", error);
    } else {
        console.log("Email sent successfully:", info.response);
    }
});
