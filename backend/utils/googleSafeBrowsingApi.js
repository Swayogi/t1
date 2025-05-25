const axios = require('axios');
const apiKeys = require('../config/apiKeys');

const googleSafeBrowsingApiUrl = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';
const googleSafeBrowsingApiKey = apiKeys.googleSafeBrowsing.apiKey;

const checkUrl = async (urlToScan) => {
  if (googleSafeBrowsingApiKey === 'YOUR_GOOGLE_SAFE_BROWSING_API_KEY_PLACEHOLDER') {
    console.warn('Google Safe Browsing API key is a placeholder. Please configure it.');
    // Return a mock safe response for placeholder
    return { error: 'API key not configured', data: null, safe: true, details: 'Google Safe Browsing API key is a placeholder.' };
  }

  try {
    const response = await axios.post(
      `${googleSafeBrowsingApiUrl}?key=${googleSafeBrowsingApiKey}`,
      {
        client: {
          clientId: 'phishnetapp', // Replace with your app's name
          clientVersion: '1.0.0',
        },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url: urlToScan }],
        },
      }
    );

    // If matches are found, the URL is considered malicious
    const isMalicious = response.data.matches && response.data.matches.length > 0;
    
    return {
      source: 'GoogleSafeBrowsing',
      isMalicious,
      threatTypes: isMalicious ? response.data.matches.map(match => match.threatType) : [],
      rawData: response.data,
    };
  } catch (error) {
    console.error('Error fetching Google Safe Browsing report:', error.message);
     // Check if the error is due to the placeholder key (Google typically returns 400 or 403 for bad key)
    if (googleSafeBrowsingApiKey === 'YOUR_GOOGLE_SAFE_BROWSING_API_KEY_PLACEHOLDER' && error.response && (error.response.status === 400 || error.response.status === 403)) {
         return { error: 'Invalid API key (placeholder)', data: null, safe: true, details: 'Google Safe Browsing API key is a placeholder or invalid.' };
    }
    return { error: 'Failed to fetch Google Safe Browsing report', details: error.message, data: null };
  }
};

module.exports = {
  checkUrl,
};
