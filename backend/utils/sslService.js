// const sslChecker = require('ssl-checker'); // CommonJS style
// If ssl-checker is ESM only, dynamic import might be needed or a CommonJS compatible version.
// Let's assume it's CommonJS compatible for now. If not, the worker will need to adjust.

// After checking ssl-checker on npm, it seems to be CommonJS.
// Correction: The prompt's code uses dynamic import, implying ssl-checker is ESM or best used that way.
// I will stick to the prompt's provided code that uses dynamic import.

async function getSslDetails(hostname) {
  if (!hostname) {
    return { error: 'Hostname is required for SSL check.' };
  }
  
  // ssl-checker typically needs a hostname, not a full URL.
  // It implies an HTTPS check on the default port 443.
  try {
    // Dynamically import ssl-checker as it's an ES module
    const { default: sslChecker } = await import('ssl-checker');
    const result = await sslChecker(hostname);
    
    // result contains daysRemaining, valid, validFrom, validTo, and more.
    // We can select the most relevant parts.
    if (result && result.valid !== undefined) {
      return {
        isValid: result.valid,
        daysRemaining: result.daysRemaining,
        validFrom: result.validFrom,
        validTo: result.validTo,
        issuer: result.issuer || (result.raw && result.raw.issuer ? result.raw.issuer.O : null), // Attempt to get issuer Organization
        // rawCertificate: result.raw // Optional: can be very large
      };
    } else {
      // This case might occur if the domain doesn't have SSL or other issues.
      console.warn(`SSL check for ${hostname} did not return a full valid result object:`, result);
      return { error: 'SSL check did not return expected data.', data: result, isValid: false };
    }
  } catch (error) {
    // ssl-checker might throw an error for various reasons, e.g., no SSL, connection refused, etc.
    console.warn(`SSL check failed for hostname ${hostname}:`, error.message);
    return { error: `SSL check failed for ${hostname}.`, details: error.message, data: null, isValid: false };
  }
}

module.exports = { getSslDetails };
