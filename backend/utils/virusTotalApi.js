const axios = require('axios');
const apiKeys = require('../config/apiKeys');

const virusTotalApiUrl = 'https://www.virustotal.com/api/v3';
const virusTotalApiKey = apiKeys.virusTotal.apiKey;

// Function to submit a URL for scanning
// Note: VirusTotal's API for URL submission is a bit more complex,
// often involving getting an analysis ID and then fetching the report.
// This is a simplified placeholder. A more robust implementation
// might first get a URL ID, then request an analysis, then fetch the report.
// For now, we'll simulate a direct "check" if possible, or focus on fetching a report for a URL.
// Let's assume we are fetching a report for a URL that might have been scanned.
// The typical way is to get a URL's report by its ID (SHA256, MD5, etc. of the URL content, or the URL itself base64 encoded).
// For simplicity, we'll use the URL itself as an identifier if the API supports it directly or use a /url/report endpoint.
// The v3 API uses /urls/{url_id} where url_id is base64 of the URL.

const getUrlReport = async (urlToScan) => {
  if (virusTotalApiKey === 'YOUR_VIRUSTOTAL_API_KEY_PLACEHOLDER') {
    console.warn('VirusTotal API key is a placeholder. Please configure it.');
    // Return a mock error or safe response for placeholder
    return { error: 'API key not configured', data: null, safe: true, details: 'VirusTotal API key is a placeholder.' };
  }

  // Base64 encode the URL for VirusTotal API v3
  const urlId = Buffer.from(urlToScan).toString('base64').replace(/=/g, '');

  try {
    const response = await axios.get(`${virusTotalApiUrl}/urls/${urlId}`, {
      headers: {
        'x-apikey': virusTotalApiKey,
      },
    });
    // Process the response to determine if malicious
    // This is a simplified check. A real implementation would parse more attributes.
    const attributes = response.data.data.attributes;
    const stats = attributes.last_analysis_stats;
    const isMalicious = stats.malicious > 0 || stats.suspicious > 0;
    
    return { 
      source: 'VirusTotal',
      isMalicious, 
      stats,
      reportUrl: `https://www.virustotal.com/gui/url/${urlId}/detection`, // Link to the GUI report
      rawData: response.data 
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // URL not found in VirusTotal, could mean it's not been scanned or it's clean
      // For now, let's treat "not found" as "not malicious" from VT's perspective, or needing submission
      // A full implementation might then submit the URL for analysis.
      console.log(`URL ${urlToScan} (ID: ${urlId}) not found in VirusTotal. It may need to be submitted for analysis first.`);
      return { source: 'VirusTotal', isMalicious: false, stats: { harmless: 0, malicious: 0, suspicious: 0, undetected: 0, timeout: 0 }, message: 'URL not found in VirusTotal database.' };
    }
    console.error('Error fetching VirusTotal report:', error.message);
    // Check if the error is due to the placeholder key
    if (virusTotalApiKey === 'YOUR_VIRUSTOTAL_API_KEY_PLACEHOLDER' && error.response && error.response.status === 401) {
         return { error: 'Invalid API key (placeholder)', data: null, safe: true, details: 'VirusTotal API key is a placeholder or invalid.' };
    }
    return { error: 'Failed to fetch VirusTotal report', details: error.message, data: null };
  }
};

module.exports = {
  getUrlReport,
};
