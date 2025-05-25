const axios = require('axios'); // Ensure axios is imported
const { getUrlReport: getVirusTotalReport } = require('../utils/virusTotalApi');
const { checkUrl: checkGoogleSafeBrowsing } = require('../utils/googleSafeBrowsingApi');
// const Scan = require('../models/Scan'); // Future: To save scan results

const mlModelApiUrl = process.env.ML_MODEL_API_URL || 'http://localhost:5000/predict'; // Or some config

// @desc    Scan a URL using external APIs and ML model
// @route   POST /api/scan
// @access  Private (to be protected later)
exports.scanUrl = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ msg: 'URL is required' });
  }

  try {
    const vtPromise = getVirusTotalReport(url);
    const gsbPromise = checkGoogleSafeBrowsing(url);
    
    // ML Model Prediction Call
    const mlPromise = axios.post(mlModelApiUrl, { url })
      .then(response => response.data)
      .catch(error => {
        console.error('Error calling ML model API:', error.message);
        // Return a consistent error structure or a default non-prediction
        return { 
          error: 'ML model prediction failed', 
          details: error.message, 
          is_phishing: null, // Indicate that ML prediction wasn't successful
          url: url 
        };
      });

    // Wait for all promises to resolve
    const [vtResult, gsbResult, mlResult] = await Promise.all([vtPromise, gsbPromise, mlPromise]);

    const results = {
      url,
      virusTotal: vtResult,
      googleSafeBrowsing: gsbResult,
      mlModel: mlResult, // Add ML result here
      // Updated overall assessment (simplified, consider ML result)
      // This logic can be more sophisticated
      isMalicious: (vtResult && vtResult.isMalicious) || 
                   (gsbResult && gsbResult.isMalicious) ||
                   (mlResult && mlResult.is_phishing === true), // Check for explicit true
    };
    
    // Future: Save scan results to database
    // const newScan = new Scan({ userId: req.user.id, url, results }); // req.user.id from auth middleware
    // await newScan.save();

    res.json(results);

  } catch (err) {
    console.error('Error in scanUrl controller:', err.message);
    res.status(500).send('Server error during scan');
  }
};
