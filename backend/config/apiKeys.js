// In a real application, these should be stored in environment variables
// and accessed via process.env.VARIABLE_NAME

module.exports = {
  virusTotal: {
    apiKey: process.env.VIRUSTOTAL_API_KEY || 'YOUR_VIRUSTOTAL_API_KEY_PLACEHOLDER',
  },
  googleSafeBrowsing: {
    apiKey: process.env.GOOGLE_SAFE_BROWSING_API_KEY || 'YOUR_GOOGLE_SAFE_BROWSING_API_KEY_PLACEHOLDER',
  },
};
