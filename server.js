const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const { GridFSBucket } = require('mongodb');
const multer = require('multer');

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
    name: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    phoneNo: { type: Number, unique: true },
    date: String
});

const scheduleSchema = new mongoose.Schema({
    classId: { type: Number, unique: false },
    className: { type: String, unique: false },
    trainerId: { type: Number },
    maxCapacity: Number,
    schedule: String
});

const User = mongoose.model('User', userSchema);
const Schedule = mongoose.model('Schedule', scheduleSchema);

// Routes
app.post('/signup', async (req, res) => {
    const { name, email, password, confirmPassword, phoneNo, date } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match!' });
    }

    try {
        const user = new User({ name, email, password, phoneNo, date });
        const isEmailPresent = await User.findOne({ email: email })
        const isNamePresent = await User.findOne({ name })
        const isNoPresent = await User.findOne({ phoneNo })
        if (isEmailPresent) {
            res.status(400).json({ message: 'Email already exists.' });
            return;
        }
        if (isNamePresent) {
            res.status(400).json({ message: 'Name already exists.' });
            return;
        }
        if (isNoPresent) {
            res.status(400).json({ message: 'Phone No already exists.' });
            return;
        }
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

app.post('', async(req,res) => {
    const {  } = req.body; // take data into varialble from req body
})

//to be used in html js to call backeng
// fetch('http://localhost:3000/', {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({jsObject}),
// })

app.post('/schedule', async(req,res) => {

    const { classId, className, trainerId, schedule, maxCapacity } = req.body; // classId,className etc... the key should be same as what you are passing from html/js

    try {
        const sc = new Schedule({ classId, className, trainerId, schedule, maxCapacity });
        await sc.save();
        res.status(200).json({ message: 'Schedule confirmed!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error logging in!' });
    }
})


// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});





// let gfs;
// const conn = mongoose.connection;
// conn.once('open', () => {
//     gfs = new GridFSBucket(conn.db, { bucketName: 'uploads' });
//     console.log('GridFS Initialized');
// })

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// app.post('/upload', upload.single('image'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ message: 'No file uploaded' });
//     }
//     const { buffer, originalname, mimetype } = req.file;

//     console.log('Received file:', originalname, mimetype);

//     if (!gfs) {
//         return res.status(500).json({ message: 'GridFS is not initialized' });
//     }

//     const writeStream = gfs.openUploadStream(originalname, {
//         content_type: mimetype,
//     });

//     writeStream.on('finish', (file) => {
//         const fileId= writeStream.id;
//         console.log('File uploaded successfully:', fileId);
//         res.status(200).json({
//             message: 'File uploaded successfully!',
//             fileId: fileId,
//         });
//     });

//     writeStream.on('error', (err) => {
//         res.status(500).json({ message: 'Error uploading file', error: err });
//     });

//     writeStream.end(buffer);
// });

// app.get('/file/:id', (req, res) => {
//     const fileId = req.params.id;

//     if (!gfs) {
//         return res.status(500).json({ message: 'GridFSBucket is not initialized' });
//     }

//     const downloadStream = gfs.openDownloadStream(new mongoose.Types.ObjectId(fileId));

//     downloadStream.on('data', (chunk) => {
//         res.write(chunk);
//     });

//     downloadStream.on('end', () => {
//         res.end();
//     });

//     downloadStream.on('error', (err) => {
//         console.error('Error fetching file:', err);
//         res.status(500).json({ message: 'Error fetching file', error: err });
//     });
// });
