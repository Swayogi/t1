// At the top of scanController.js
const axios = require('axios');
const { getUrlReport: getVirusTotalReport } = require('../utils/virusTotalApi');
const { checkUrl: checkGoogleSafeBrowsing } = require('../utils/googleSafeBrowsingApi');
const { getWhoisData } = require('../utils/whoisService'); 
const { getSslDetails } = require('../utils/sslService'); // Added SSL service
const dns = require('dns').promises; 
const { URL } = require('url');   
const Scan = require('../models/Scan'); // Will be needed when saving

const mlModelApiUrl = process.env.ML_MODEL_API_URL || 'http://localhost:5000/predict';

exports.scanUrl = async (req, res, next) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ msg: 'URL is required' });
  }

  try {
    const newScanEntry = new Scan({
      user: req.user ? req.user.id : null, // Assumes authMiddleware populates req.user
      url: url,
      status: 'pending' // Explicitly set, though model has default
      // All other fields from the Scan model (like 'results') will be empty or have their defaults
    });

    const savedScan = await newScanEntry.save();
    
    // Respond with the newly created scan record
    res.status(201).json(savedScan);

  } catch (dbError) {
    console.error('Error creating new scan entry:', dbError.message);
    next(dbError); // Pass to centralized error handler
  }
};

// @desc    Get a specific scan by its ID
// @route   GET /api/scan/:id
// @access  Private (requires auth)
exports.getScanById = async (req, res, next) => {
  try {
    // Re-import Scan model if it was commented out or ensure it's available
    // const Scan = require('../models/Scan'); // Already imported at the top of the file

    const scan = await Scan.findById(req.params.id);

    if (!scan) {
      return res.status(404).json({ msg: 'Scan not found' });
    }

    // Optional: Check if the logged-in user has permission to view this scan.
    // For example, if scans are tied to users:
    // if (scan.user && scan.user.toString() !== req.user.id && !req.user.isAdmin) {
    //   return res.status(403).json({ msg: 'User not authorized to view this scan' });
    // }
    // For now, if the user is authenticated, they can fetch any scan by ID.
    // This could be refined later based on privacy requirements.

    res.json(scan);

  } catch (err) {
    console.error(`Error in getScanById: ${err.message}`);
    if (err.kind === 'ObjectId') { // Handle invalid MongoDB ID format
      return res.status(400).json({ msg: 'Invalid scan ID format' });
    }
    // Pass to centralized error handler
    next(err);
  }
};
