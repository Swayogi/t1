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
    // Existing fields
    virusTotal: Object,
    googleSafeBrowsing: Object,
    mlModel: Object,
    
    // New fields for network and domain details
    networkInfo: {
      ipAddress: String,
      finalUrl: String,
      httpStatusCode: Number,
      geolocation: { // Add this
        country: String,
        region: String,
        city: String,
        error: String,
      },
      hostingProvider: { // Add this
        name: String,
        error: String,
      },
      error: String, // To store any errors during network info gathering
    },
    whoisInfo: {
      registrar: String,
      creationDate: String, // Or Date, consider consistency
      updatedDate: String,  // Or Date
      expirationDate: String, // Or Date
      nameServers: [String],
      error: String, // To store any errors during WHOIS lookup
      // raw: Object, // Optionally store raw WHOIS data if needed, can be large
    },
    sslCertificateInfo: {
      isValid: Boolean,
      daysRemaining: Number,
      validFrom: String, // Or Date
      validTo: String,   // Or Date
      issuer: String,
      error: String, // To store any errors during SSL check
      isHttps: Boolean, // To indicate if SSL check was applicable
      // rawCertificate: Object, // Optional
    },
    
    // Existing overall status
    isMalicious: Boolean, // Overall malicious status based on all sources
    screenshotPath: String, // Add this
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Scan', ScanSchema);
