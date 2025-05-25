require('dotenv').config(); // Loads .env file contents into process.env
const path = require('path'); // Add this
const express = require('express');
const connectDB = require('./config/db'); // Import DB connection
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON bodies

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Define Routes
// Original root route, now changed to /api/status
app.get('/api/status', (req, res) => {
  res.send('PhishNet Backend API is Running!');
});
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/scan', require('./routes/scanRoutes')); // Mount scan routes
app.use('/api/admin', require('./routes/adminRoutes')); // Mount admin routes

// Connect to MongoDB
connectDB();

// Centralized Error Handler - Must be last app.use() call before app.listen()
const errorHandlerMiddleware = require('./middleware/errorHandlerMiddleware');
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
