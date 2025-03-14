require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/minnat_vigour_gym", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Define the Schema
const loginAttemptSchema = new mongoose.Schema({
    username: String,
    success: Boolean,
    timestamp: { type: Date, default: Date.now }
});

// Use the correct collection name
const LoginAttempt = mongoose.model("AdminLogin", loginAttemptSchema, "admin_login");

// Get Admin Credentials from .env
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);

// API for Admin Login
app.post("/admin-login", async (req, res) => {
    const { username, password } = req.body;

    if (username !== ADMIN_USERNAME) {
        await LoginAttempt.create({ username, success: false });
        return res.json({ success: false, message: "Invalid Username!" });
    }

    const passwordMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!passwordMatch) {
        await LoginAttempt.create({ username, success: false });
        return res.json({ success: false, message: "Incorrect Password!" });
    }

    await LoginAttempt.create({ username, success: true });
    res.json({ success: true, message: "Login Successful!" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
