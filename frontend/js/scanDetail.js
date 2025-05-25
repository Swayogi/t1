document.addEventListener('DOMContentLoaded', async () => {
  const messageDiv = document.getElementById('message'); // Assuming a div with id="message" for errors
  
  // Helper function to safely set text content
  const setText = (id, text) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text !== null && text !== undefined ? String(text) : 'N/A';
    } else {
      console.warn(`Element with ID '${id}' not found.`);
    }
  };

  // Helper function to display errors
  const displayError = (sectionId, error) => {
    const errorDiv = document.getElementById(sectionId);
    if (errorDiv) {
      if (typeof error === 'string' && error.trim() !== '') {
        errorDiv.textContent = error;
        errorDiv.style.display = 'block'; // Make it visible
      } else if (error && typeof error.message === 'string' && error.message.trim() !== '') {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
      } else if (typeof error === 'object' && error !== null) {
        errorDiv.textContent = JSON.stringify(error); // Fallback for object errors
        errorDiv.style.display = 'block';
      }
       else {
        errorDiv.style.display = 'none'; // Hide if no error
      }
    }
  };
  
  // Helper function to populate list items
  const populateList = (ulId, items) => {
    const ul = document.getElementById(ulId);
    if (ul) {
      ul.innerHTML = ''; // Clear existing items
      if (Array.isArray(items) && items.length > 0) {
        items.forEach(item => {
          const li = document.createElement('li');
          li.className = 'list-group-item'; // Optional: Bootstrap styling
          li.textContent = item;
          ul.appendChild(li);
        });
      } else if (items && typeof items === 'string') { // Handle single string as a list item
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = items;
        ul.appendChild(li);
      } else {
        const li = document.createElement('li');
        li.className = 'list-group-item text-muted';
        li.textContent = 'N/A';
        ul.appendChild(li);
      }
    }
  };

  // Get scan ID from URL query parameter
  const queryParams = new URLSearchParams(window.location.search);
  const scanId = queryParams.get('id');

  if (!scanId) {
    if (messageDiv) {
        messageDiv.textContent = 'Scan ID not found in URL.';
        messageDiv.className = 'alert alert-danger';
    } else {
        alert('Scan ID not found in URL.'); // Fallback
    }
    // Optionally redirect or hide content sections
    return;
  }

  // Set the title or a header with the scan ID
  setText('scanDetailTitle', `Scan Details for ID: ${scanId}`); // Assuming an H1 or similar with id="scanDetailTitle"

  try {
    if (!window.apiService || typeof window.apiService.get !== 'function') {
      throw new Error('ApiService not available. Ensure js/apiService.js is loaded correctly.');
    }
    
    const scanData = await window.apiService.get(`/scan/${scanId}`);
    
    if (!scanData || !scanData.results) {
        throw new Error('Invalid scan data received from API.');
    }
    const results = scanData.results;

    // Populate original URL (assuming it's stored at top level of scanData or in results)
    // The HTML uses id="scanUrlOriginal" for the span holding the URL.
    setText('scanUrlOriginal', scanData.url || results.url || 'N/A'); 
    setText('scanDate', scanData.scannedAt ? new Date(scanData.scannedAt).toLocaleString() : 'N/A');


    // Populate Network Information
    if (results.networkInfo) {
      setText('scanIpAddress', results.networkInfo.ipAddress);
      setText('scanFinalUrl', results.networkInfo.finalUrl);
      setText('scanHttpStatusCode', results.networkInfo.httpStatusCode);
      displayError('scanNetworkError', results.networkInfo.error);
    } else {
        displayError('scanNetworkError', 'Network information not available.');
    }

    // Populate WHOIS Information
    if (results.whoisInfo) {
      setText('whoisRegistrar', results.whoisInfo.registrar);
      setText('whoisCreationDate', results.whoisInfo.creationDate ? new Date(results.whoisInfo.creationDate).toLocaleDateString() : 'N/A');
      setText('whoisUpdatedDate', results.whoisInfo.updatedDate ? new Date(results.whoisInfo.updatedDate).toLocaleDateString() : 'N/A');
      setText('whoisExpirationDate', results.whoisInfo.expirationDate ? new Date(results.whoisInfo.expirationDate).toLocaleDateString() : 'N/A');
      populateList('whoisNameServers', results.whoisInfo.nameServers);
      displayError('whoisError', results.whoisInfo.error);
    } else {
        displayError('whoisError', 'WHOIS information not available.');
    }

    // Populate SSL Certificate Information
    if (results.sslCertificateInfo) {
      setText('sslIsHttps', results.sslCertificateInfo.isHttps !== undefined ? (results.sslCertificateInfo.isHttps ? 'Yes' : 'No') : 'N/A');
      if (results.sslCertificateInfo.isHttps || results.sslCertificateInfo.isValid !== undefined) { 
        setText('sslIsValid', results.sslCertificateInfo.isValid ? 'Valid' : 'Invalid/Not Applicable');
        setText('sslIssuer', results.sslCertificateInfo.issuer);
        setText('sslValidFrom', results.sslCertificateInfo.validFrom ? new Date(results.sslCertificateInfo.validFrom).toLocaleDateString() : 'N/A');
        setText('sslValidTo', results.sslCertificateInfo.validTo ? new Date(results.sslCertificateInfo.validTo).toLocaleDateString() : 'N/A');
        setText('sslDaysRemaining', results.sslCertificateInfo.daysRemaining);
      } else {
        setText('sslIsValid', 'N/A (Not HTTPS or no data)');
        setText('sslIssuer', 'N/A');
        setText('sslValidFrom', 'N/A');
        setText('sslValidTo', 'N/A');
        setText('sslDaysRemaining', 'N/A');
      }
      displayError('sslError', results.sslCertificateInfo.error);
    } else {
        displayError('sslError', 'SSL Certificate information not available.');
    }
    
    // Populate VirusTotal Results (example, assuming structure)
    if (results.virusTotal && results.virusTotal.stats) {
        const vtStats = results.virusTotal.stats;
        setText('vtMalicious', vtStats.malicious);
        setText('vtSuspicious', vtStats.suspicious);
        setText('vtHarmless', vtStats.harmless);
        setText('vtUndetected', vtStats.undetected); // Added based on previous HTML update
        const vtReportLink = document.getElementById('vtReportLink');
        if(vtReportLink && results.virusTotal.reportUrl) {
            vtReportLink.href = results.virusTotal.reportUrl;
            vtReportLink.style.display = 'inline';
        } else if (vtReportLink) {
            vtReportLink.style.display = 'none';
        }
        displayError('vtError', results.virusTotal.error);
    } else {
        setText('vtMalicious', 'N/A');
        setText('vtSuspicious', 'N/A');
        setText('vtHarmless', 'N/A');
        setText('vtUndetected', 'N/A');
        displayError('vtError', results.virusTotal ? results.virusTotal.error : 'VirusTotal data not available.');
    }

    // Populate Google Safe Browsing Results (example)
    if (results.googleSafeBrowsing) {
        setText('gsbIsMalicious', results.googleSafeBrowsing.isMalicious ? 'Yes' : 'No');
        populateList('gsbThreatTypes', results.googleSafeBrowsing.threatTypes);
        displayError('gsbError', results.googleSafeBrowsing.error);
    } else {
        setText('gsbIsMalicious', 'N/A');
        populateList('gsbThreatTypes', []);
        displayError('gsbError', 'Google Safe Browsing data not available.');
    }
    
    // Populate ML Model Results (example)
    if (results.mlModel) {
        setText('mlIsPhishing', results.mlModel.is_phishing !== null ? (results.mlModel.is_phishing ? 'Yes' : 'No') : 'N/A');
        setText('mlConfidence', results.mlModel.confidence !== null && results.mlModel.confidence !== undefined ? (results.mlModel.confidence * 100).toFixed(2) + '%' : 'N/A');
        displayError('mlError', results.mlModel.error);
    } else {
        setText('mlIsPhishing', 'N/A');
        setText('mlConfidence', 'N/A');
        displayError('mlError', 'ML Model data not available.');
    }

    // Overall Malicious Status
    setText('overallMaliciousStatus', results.isMalicious ? 'DANGEROUS' : 'SAFE');
    const statusElement = document.getElementById('overallMaliciousStatus');
    if(statusElement) {
        statusElement.className = results.isMalicious ? 'text-danger fw-bold' : 'text-success fw-bold';
    }

  } catch (error) {
    console.error('Failed to fetch or display scan details:', error);
    const mainErrorMsg = error.data && error.data.msg ? error.data.msg : error.message;
    if (messageDiv) {
        messageDiv.textContent = `Error: ${mainErrorMsg}`;
        messageDiv.className = 'alert alert-danger';
    } else {
        alert(`Error fetching scan details: ${mainErrorMsg}`);
    }
  }
});
