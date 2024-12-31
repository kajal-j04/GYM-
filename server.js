const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

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
    name: String,
    email: { type: String, unique: true },
    password: String,
});

const User = mongoose.model('User', userSchema);

// Routes
app.post('/signup', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match!' });
    }

    try {
        const user = new User({ name, email, password });
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

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
