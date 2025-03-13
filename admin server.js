// server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

// Enable CORS for all requests
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Connect to MongoDB
const mongoURI = "mongodb://localhost:27017/gymDB"; // Replace with your connection string if needed
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Mongoose Schemas and Models

// Member Schema & Model
const memberSchema = new mongoose.Schema({
  name: String,
  membershipType: String,
  image: String
});
const Member = mongoose.model("Member", memberSchema);

// Trainer Schema & Model
const trainerSchema = new mongoose.Schema({
  name: String,
  specialty: String,
  image: String
});
const Trainer = mongoose.model("Trainer", trainerSchema);

// Staff Schema & Model
const staffSchema = new mongoose.Schema({
  name: String,
  position: String,
  image: String
});
const Staff = mongoose.model("Staff", staffSchema);

// Equipment Schema & Model
const equipmentSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  image: String
});
const Equipment = mongoose.model("Equipment", equipmentSchema);

// Dashboard endpoint (provides counts from MongoDB)
app.get("/dashboard", async (req, res) => {
  try {
    const totalMembers = await Member.countDocuments();
    const totalTrainers = await Trainer.countDocuments();
    const totalStaff = await Staff.countDocuments();
    const totalEquipment = await Equipment.countDocuments();

    res.json({ totalMembers, totalTrainers, totalStaff, totalEquipment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching dashboard data" });
  }
});

// --- Member Endpoints ---
// Get all members
app.get("/members", async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching members" });
  }
});
// Add a new member
app.post("/members", async (req, res) => {
  try {
    const newMember = new Member(req.body);
    await newMember.save();
    res.json({ success: true, message: "Member added successfully", member: newMember });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error adding member" });
  }
});
// Update a member
app.put("/members/:id", async (req, res) => {
  try {
    const updatedMember = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedMember) {
      res.json({ success: true, message: "Member updated successfully", member: updatedMember });
    } else {
      res.status(404).json({ success: false, message: "Member not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating member" });
  }
});
// Delete a member
app.delete("/members/:id", async (req, res) => {
  try {
    const deletedMember = await Member.findByIdAndDelete(req.params.id);
    if (deletedMember) {
      res.json({ success: true, message: "Member deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Member not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting member" });
  }
});

// --- Trainer Endpoints ---
// Get all trainers
app.get("/trainers", async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.json(trainers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching trainers" });
  }
});
// Add a new trainer
app.post("/trainers", async (req, res) => {
  try {
    const newTrainer = new Trainer(req.body);
    await newTrainer.save();
    res.json({ success: true, message: "Trainer added successfully", trainer: newTrainer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error adding trainer" });
  }
});
// Update a trainer
app.put("/trainers/:id", async (req, res) => {
  try {
    const updatedTrainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedTrainer) {
      res.json({ success: true, message: "Trainer updated successfully", trainer: updatedTrainer });
    } else {
      res.status(404).json({ success: false, message: "Trainer not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating trainer" });
  }
});
// Delete a trainer
app.delete("/trainers/:id", async (req, res) => {
  try {
    const deletedTrainer = await Trainer.findByIdAndDelete(req.params.id);
    if (deletedTrainer) {
      res.json({ success: true, message: "Trainer deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Trainer not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting trainer" });
  }
});

// --- Staff Endpoints ---
// Get all staff
app.get("/staff", async (req, res) => {
  try {
    const staffMembers = await Staff.find();
    res.json(staffMembers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching staff" });
  }
});
// Add new staff
app.post("/staff", async (req, res) => {
  try {
    const newStaff = new Staff(req.body);
    await newStaff.save();
    res.json({ success: true, message: "Staff added successfully", staff: newStaff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error adding staff" });
  }
});
// Update a staff member
app.put("/staff/:id", async (req, res) => {
  try {
    const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedStaff) {
      res.json({ success: true, message: "Staff updated successfully", staff: updatedStaff });
    } else {
      res.status(404).json({ success: false, message: "Staff not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating staff" });
  }
});
// Delete a staff member
app.delete("/staff/:id", async (req, res) => {
  try {
    const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
    if (deletedStaff) {
      res.json({ success: true, message: "Staff deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Staff not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting staff" });
  }
});

// --- Equipment Endpoints ---
// Get all equipment
app.get("/equipment", async (req, res) => {
  try {
    const equipmentItems = await Equipment.find();
    res.json(equipmentItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching equipment" });
  }
});
// Add new equipment
app.post("/equipment", async (req, res) => {
  try {
    const newEquipment = new Equipment(req.body);
    await newEquipment.save();
    res.json({ success: true, message: "Equipment added successfully", equipment: newEquipment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error adding equipment" });
  }
});
// Update equipment
app.put("/equipment/:id", async (req, res) => {
  try {
    const updatedEquipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedEquipment) {
      res.json({ success: true, message: "Equipment updated successfully", equipment: updatedEquipment });
    } else {
      res.status(404).json({ success: false, message: "Equipment not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating equipment" });
  }
});
// Delete equipment
app.delete("/equipment/:id", async (req, res) => {
  try {
    const deletedEquipment = await Equipment.findByIdAndDelete(req.params.id);
    if (deletedEquipment) {
      res.json({ success: true, message: "Equipment deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Equipment not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting equipment" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
