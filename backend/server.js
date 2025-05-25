const express = require('express');
const connectDB = require('./config/db'); // Import DB connection
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON bodies

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/scan', require('./routes/scanRoutes')); // Mount scan routes
app.use('/api/admin', require('./routes/adminRoutes')); // Mount admin routes

// Placeholder route
app.get('/', (req, res) => {
  res.send('PhishNet Backend is Running!');
});

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
