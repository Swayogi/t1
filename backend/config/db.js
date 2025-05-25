const mongoose = require('mongoose');

// Replace with your actual MongoDB connection string (e.g., from environment variables)
const MONGO_URI = 'mongodb://localhost:27017/phishnet'; 

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
