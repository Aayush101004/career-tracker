const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// THE FIX: Tell dotenv to look for the .env file one directory up (in the root folder)
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());


// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));


// --- Routes ---
app.use('/projects', require('./routes/projects'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/import', require('./routes/api/import'));
app.use('/api/interview', require('./routes/api/interview'));
app.use('/api/resume', require('./routes/api/resume'));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT || 10000}`);
});

