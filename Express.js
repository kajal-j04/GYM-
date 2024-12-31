// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs'); // For password hashing
const cors = require('cors'); // Import cors middleware
require('dotenv').config(); // Load environment variables

const app = express();
app.use(express.json()); // Parse JSON requests
app.use(cors())
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB locally");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});

// Define the User schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: Date, required: true },
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Middleware to check validation results
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Signup route
app.post(
    '/signup',
    [
        body('name')
            .trim()
            .isAlpha('en-US', { ignore: ' ' })
            .withMessage('Name must contain only characters.')
            .notEmpty()
            .withMessage('Name is required.'),

        body('email')
            .isEmail()
            .withMessage('Invalid email address.')
            .notEmpty()
            .withMessage('Email is required.'),

        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long.')
            .notEmpty()
            .withMessage('Password is required.'),

        // Confirm password validation
        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords do not match.');
                }
                return true;
            })
            .notEmpty()
            .withMessage('Confirm password is required.'),

        body('phone')
            .isNumeric()
            .withMessage('Phone number must contain only numbers.')
            .isLength({ min: 8, max: 12 })
            .withMessage('Phone number must be 8, 10, or 12 digits long.'),

        body('dob')
            .isISO8601()
            .withMessage('Date of birth must be a valid date.')
            .notEmpty()
            .withMessage('Date of birth is required.')
    ],
    validateRequest,
    async (req, res) => {
        try {
            const { name, email, password, phone, dob } = req.body;

            // Check if the user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use.' });
            }

            // Hash the password before saving to the database
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                phone,
                dob,
            });

            // Save the user to the database
            await newUser.save();

            res.status(201).json({
                message: 'User registered successfully!',
                data: { name, email, phone, dob },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error registering user.' });
        }
    }
);

// Login route
app.post(
    '/login',
    [
        body('email')
            .isEmail()
            .withMessage('Invalid email address.')
            .notEmpty()
            .withMessage('Email is required.'),

        body('password')
            .notEmpty()
            .withMessage('Password is required.')
    ],
    validateRequest,
    async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid email or password.' });
            }

            // Compare password with hashed password in the database
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid email or password.' });
            }

            res.status(200).json({
                message: 'Login successful!',
                data: { email },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error logging in user.' });
        }
    }
);

// Start the server
const PORT = process.env.PORT || 3000; // Change to a different port if needed
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
