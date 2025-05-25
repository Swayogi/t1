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

exports.scanUrl = async (req, res, next) => { // Added next for error handling
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ msg: 'URL is required' });
  }

  // --- Start of Network Info Gathering ---
  let networkInfo = {
    ipAddress: null,
    finalUrl: url,
    httpStatusCode: null,
    error: null // To store any errors during network info gathering
  };

  try {
    const parsedUrl = new URL(url); // Throws if URL is invalid
    const hostname = parsedUrl.hostname;

    try {
      const address = await dns.lookup(hostname);
      networkInfo.ipAddress = address.address; // dns.lookup can return an object or string
    } catch (dnsError) {
      console.warn(`DNS lookup failed for ${hostname}: ${dnsError.message}`);
      networkInfo.error = (networkInfo.error || '') + `DNS lookup failed for ${hostname}. `;
    }
    
    try {
      const response = await axios.get(url, { 
        timeout: 10000, 
        maxRedirects: 10, // Explicitly set max redirects
        validateStatus: (status) => status >= 200 && status < 600 
      });
      // Accessing final URL: axios stores it in `response.request.res.responseUrl`
      // or if that's not present (e.g. no redirects), it's the original URL.
      networkInfo.finalUrl = response.request.res.responseUrl || response.config.url;
      networkInfo.httpStatusCode = response.status;
    } catch (httpError) {
      console.warn(`HTTP/S request to ${url} failed: ${httpError.message}`);
      networkInfo.error = (networkInfo.error || '') + `HTTP/S request failed. `;
      if (httpError.response) {
        networkInfo.httpStatusCode = httpError.response.status;
        networkInfo.finalUrl = httpError.config.url; // URL that failed
      } else {
        networkInfo.httpStatusCode = 0; // Indicate client-side error with axios (e.g. timeout)
      }
    }
  } catch (urlParseError) {
      console.warn(`Invalid URL provided: ${urlParseError.message}`);
      // If URL is fundamentally invalid, we might not proceed with other scans,
      // or let them run and they'll likely fail for the invalid URL.
      // For now, we'll note the error and continue.
      networkInfo.error = (networkInfo.error || '') + `Invalid URL format. `;
      // Set finalUrl to the problematic URL itself
      networkInfo.finalUrl = url; 
  }
  // --- End of Network Info Gathering ---

  // --- Start of WHOIS Info Gathering ---
  let whoisInfo = null;
  // Use hostname from finalUrl if available and valid, otherwise from original URL
  let domainForWhois = networkInfo.finalUrl || url;
  try {
      const parsedDomainForWhois = new URL(domainForWhois);
      const hostnameForWhois = parsedDomainForWhois.hostname;
      // Remove 'www.' prefix for more consistent WHOIS lookups if present
      const effectiveHostname = hostnameForWhois.startsWith('www.') ? hostnameForWhois.substring(4) : hostnameForWhois;

      if (effectiveHostname) {
          whoisInfo = await getWhoisData(effectiveHostname);
      } else {
          whoisInfo = { error: 'Could not determine a valid domain for WHOIS lookup.' };
      }
  } catch (e) {
      console.warn(`Could not parse domain for WHOIS lookup from ${domainForWhois}: ${e.message}`);
      whoisInfo = { error: `Invalid domain for WHOIS lookup: ${domainForWhois}` };
  }
  // --- End of WHOIS Info Gathering ---

  // --- Start of SSL Info Gathering ---
  let sslInfo = null;
  let finalUrlForSsl = networkInfo.finalUrl || url; // Use final URL

  try {
    const parsedUrlForSsl = new URL(finalUrlForSsl);
    if (parsedUrlForSsl.protocol === 'https:') {
      const hostnameForSsl = parsedUrlForSsl.hostname;
      if (hostnameForSsl) {
        sslInfo = await getSslDetails(hostnameForSsl);
      } else {
        sslInfo = { error: 'Could not determine a valid hostname for SSL check from URL.', url: finalUrlForSsl };
      }
    } else {
      sslInfo = { message: 'URL is not HTTPS, SSL check not performed.', isHttps: false };
    }
  } catch(e) {
    console.warn(`Could not parse URL for SSL check ${finalUrlForSsl}: ${e.message}`);
    sslInfo = { error: `Invalid URL for SSL check: ${finalUrlForSsl}` };
  }
  // --- End of SSL Info Gathering ---

  try {
    const vtPromise = getVirusTotalReport(url);
    const gsbPromise = checkGoogleSafeBrowsing(url);
    const mlPromise = axios.post(mlModelApiUrl, { url })
      .then(response => response.data)
      .catch(error => {
        console.error('Error calling ML model API:', error.message);
        return { error: 'ML model prediction failed', details: error.message, is_phishing: null, url: url };
      });

    const [vtResult, gsbResult, mlResult] = await Promise.all([vtPromise, gsbPromise, mlPromise]);

    const results = {
      url,
      networkInfo, 
      whoisInfo, 
      sslInfo, // Added SSL information
      virusTotal: vtResult,
      googleSafeBrowsing: gsbResult,
      mlModel: mlResult,
      isMalicious: (vtResult && vtResult.isMalicious) ||
                   (gsbResult && gsbResult.isMalicious) ||
                   (mlResult && mlResult.is_phishing === true),
    };
    
    // Save the scan results to the database
    try {
        // Scan model is already imported at the top of the file
        const newScanEntry = new Scan({
            user: req.user.id, // From authMiddleware
            url: results.url,  // The original URL scanned
            results: results   // The comprehensive results object
        });

        const savedScan = await newScanEntry.save();
        
        res.status(201).json(savedScan); // Return the saved scan object with its _id, status 201 for created

    } catch (dbError) {
        console.error('Error saving scan to database:', dbError.message);
        // Pass to centralized error handler, augmenting the message
        dbError.message = `Scan completed but failed to save to database: ${dbError.message}`;
        return next(dbError); 
    }

  } catch (err) {
    // This catch block is for errors from the external API calls (VT, GSB, ML)
    // or other errors within the main try block of scanUrl before DB save.
    next(err); // Pass to centralized error handler
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
