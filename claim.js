require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Allow CORS for frontend requests from http://127.0.0.1:5500
app.use(cors({ origin: "http://127.0.0.1:5500", methods: "POST" }));

// ✅ Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/minnat_vigour_gym', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

// ✅ Define Schemas
const Registration = mongoose.model('registrations', new mongoose.Schema({
  name: String,
  email: String
}));

const ClaimedOffer = mongoose.model('claimed_offers', new mongoose.Schema({
  name: String,
  email: String,
  claimedAt: { type: Date, default: Date.now }
}));

// ✅ Check if EMAIL_USER & EMAIL_PASS exist
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('⚠️ Warning: Email credentials missing in .env file!');
}

// ✅ Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ✅ Claim Offer API
app.post('/claim-offer', async (req, res) => {
  console.log("📩 Received Request:", req.body); // Log incoming request

  const { name, email } = req.body;

  // ✅ Validate input
  if (!name || !email) {
    console.log("❌ Validation failed: Name or email missing.");
    return res.status(400).json({ success: false, message: 'Name and email are required.' });
  }

  try {
    // ✅ Check if user is registered
    const user = await Registration.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(400).json({ success: false, message: 'User does not exist. Please register first.' });
    }

    // ✅ Check if user already claimed the offer
    const alreadyClaimed = await ClaimedOffer.findOne({ email });
    if (alreadyClaimed) {
      console.log("❌ Offer already claimed:", email);
      return res.status(400).json({ success: false, message: 'You have already claimed this offer.' });
    }

    // ✅ Store in claimed_offers collection
    await ClaimedOffer.create({ name, email });
    console.log("✅ Offer claimed successfully!");

    // ✅ Send confirmation email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🎉 Congratulations! Offer Claimed Successfully',
      text: `Hello ${name},\n\nCongratulations! You have successfully claimed your exclusive gym offer.\n\nHere are your benefits:\n\n🎯 Free Personal Training Session\n🥗 Free Nutrition Consultation\n👕 Free Gym Merchandise\n🛑 Exclusive Access to Premium Facilities\n🎁 Referral Bonus\n\nThank you for being a valued member of Minnat Vigour Gym!\n\nStay fit, stay strong! 💪`
    });

    res.status(200).json({ success: true, message: 'Offer claimed successfully! Check your email for details.' });
  } catch (error) {
    console.error("❌ Error in backend:", error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
