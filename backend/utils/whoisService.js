const whois = require('whois-json'); // Or 'node-whois' if 'whois-json' has issues

async function getWhoisData(domain) {
  if (!domain) {
    return { error: 'Domain is required for WHOIS lookup.' };
  }
  try {
    // The 'whois-json' library might sometimes return results directly,
    // or might need parsing if it's raw text.
    // It's also known that WHOIS lookups can be unreliable or rate-limited.
    // Let's assume it returns a JSON object.
    const results = await whois(domain, { follow: 2, verbose: false }); // Basic options
    
    // Select relevant fields if the result is large or deeply nested
    // This depends heavily on the library's output structure.
    // For 'whois-json', the structure can vary. We might need to adapt.
    // Common fields of interest: registrar, creationDate, updatedDate, expirationDate, nameServer
    
    // If results is an array, take the first element (some libs might return multiple records)
    const data = Array.isArray(results) ? results[0] : results;

    // Basic check for empty or error-like response from the library itself
    if (!data || Object.keys(data).length === 0 || data.error) {
        console.warn(`WHOIS lookup for ${domain} returned empty or error: `, data ? data.error : 'No data');
        return { error: `WHOIS lookup for ${domain} returned no useful data or an error.`, data: null };
    }

    // Extract common fields, be mindful of variations in field names from different registrars/servers
    const relevantInfo = {
      registrar: data.registrar || data.Registrar || null,
      creationDate: data.creationDate || data.CreationDate || data['Registry Expiry Date'] || data.created || null,
      updatedDate: data.updatedDate || data.UpdatedDate || data.updated || null,
      expirationDate: data.expirationDate || data.ExpirationDate || data.expires || null,
      nameServers: data.nameServer || data.NameServer || data.nserver || [], // Ensure it's an array
      // raw: data // Optionally include raw data for debugging, but can be very large
    };
    
    return relevantInfo;

  } catch (error) {
    console.error(`WHOIS lookup failed for domain ${domain}:`, error.message);
    return { error: `WHOIS lookup failed for domain ${domain}.`, details: error.message, data: null };
  }
}

module.exports = { getWhoisData };
