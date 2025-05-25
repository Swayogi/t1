const mongoose = require('mongoose');

const ScanSchema = new mongoose.Schema({
  user: { // User who performed the scan (if logged in)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: false, // Can be null if scan is done by an unauthenticated user
  },
  url: {
    type: String,
    required: true,
  },
  results: { // Store the combined results from APIs and ML model
    virusTotal: Object,
    googleSafeBrowsing: Object,
    mlModel: Object,
    isMalicious: Boolean, // Overall malicious status
  },
  scannedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Scan', ScanSchema);
