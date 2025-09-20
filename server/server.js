const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Make sure cors is imported
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---
app.use(cors()); // Add this line to enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));


// --- Routes ---
app.use('/projects', require('./routes/projects'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/users', require('./routes/api/users'));


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});

