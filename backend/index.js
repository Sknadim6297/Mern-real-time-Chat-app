const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();
const router = require('./routes/index');
const cookiesParser = require('cookie-parser');
const { app, server } = require('./socket/index');
const mongoose = require('mongoose'); // Import mongoose directly

const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookiesParser());
app.use(helmet()); // Security middleware
app.use(morgan('combined')); // Logging
app.use(rateLimit({ // Rate limiting
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
}));

app.get('/', (req, res) => {
    res.json({
        message: "Server running at " + PORT
    });
});

// API endpoints
app.use('/api', router);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Database connected successfully");
    server.listen(PORT, () => {
        console.log("Server running at " + PORT);
    });
}).catch(err => {
    console.error('Database connection error:', err);
});

// Graceful shutdown
const shutdown = async () => {
    try {
        await mongoose.disconnect(); // Correct way to disconnect
        console.log('MongoDB disconnected');
    } catch (error) {
        console.error('Error disconnecting MongoDB:', error);
    } finally {
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
