// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json()); // Parse JSON requests

// MongoDB Connection
const MONGO_URI = 'mongodb://localhost:27017/minnat_vigour_gym'; // Change this to your MongoDB URI
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: Date, required: true },
});

const User = mongoose.model('User', userSchema);

// Middleware to check validation results
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Signup Route
app.post(
    '/signup',
    [
        body('name').trim().isAlpha('en-US', { ignore: ' ' }).withMessage('Name must contain only characters.').notEmpty(),
        body('email').isEmail().withMessage('Invalid email address.').notEmpty(),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.').notEmpty(),
        body('phone').isNumeric().withMessage('Phone number must contain only numbers.').isLength({ min: 8, max: 12 }),
        body('dob').isISO8601().withMessage('Date of birth must be a valid date.').notEmpty(),
    ],
    validateRequest,
    async (req, res) => {
        const { name, email, password, phone, dob } = req.body;

        try {
            // Check if the user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user
            const newUser = new User({ name, email, password: hashedPassword, phone, dob });
            await newUser.save();

            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
);

// Login Route
app.post(
    '/login',
    [
        body('email').isEmail().withMessage('Invalid email address.').notEmpty(),
        body('password').notEmpty().withMessage('Password is required.')
    ],
    validateRequest,
    async (req, res) => {
        const { email, password } = req.body;

        try {
            // Find the user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Compare passwords
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Generate a JWT token
            const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

            res.status(200).json({ message: 'Login successful', token });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
