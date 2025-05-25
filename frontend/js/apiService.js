// frontend/js/apiService.js

const BASE_API_URL = '/api'; // Assuming backend API is served on the same domain

/**
 * Stores the JWT in localStorage.
 * @param {string} token The JWT to store.
 */
function storeToken(token) {
  localStorage.setItem('phishNetToken', token);
}

/**
 * Retrieves the JWT from localStorage.
 * @returns {string|null} The JWT or null if not found.
 */
function getToken() {
  return localStorage.getItem('phishNetToken');
}

/**
 * Removes the JWT from localStorage.
 */
function removeToken() {
  localStorage.removeItem('phishNetToken');
}

/**
 * Makes a POST request to the specified API endpoint.
 * @param {string} endpoint The API endpoint (e.g., '/auth/login').
 * @param {object} body The request body.
 * @returns {Promise<object>} The JSON response from the API.
 */
async function post(endpoint, body) {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`; // Or 'x-auth-token': token, depending on backend
  }

  try {
    const response = await fetch(`${BASE_API_URL}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Try to parse error response, otherwise throw generic error
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Include more details from errorData if available
      const error = new Error(errorData.message || errorData.msg || `HTTP error! status: ${response.status}`);
      error.response = response; // Attach full response
      error.data = errorData; // Attach parsed error data
      throw error;
    }
    return response.json();
  } catch (error) {
    console.error(`API POST request to ${endpoint} failed:`, error);
    throw error; // Re-throw to be caught by calling function
  }
}

/**
 * Makes a GET request to the specified API endpoint.
 * @param {string} endpoint The API endpoint (e.g., '/scan/some-scan-id').
 * @returns {Promise<object>} The JSON response from the API.
 */
async function get(endpoint) {
  const headers = {
    'Content-Type': 'application/json', // Though GET usually doesn't have a body, Content-Type for response is good.
  };
  const token = getToken(); // Assumes getToken is defined in this file
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_API_URL}${endpoint}`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const error = new Error(errorData.message || errorData.msg || `HTTP error! status: ${response.status}`);
      error.response = response;
      error.data = errorData;
      throw error;
    }
    return response.json();
  } catch (error) {
    console.error(`API GET request to ${endpoint} failed:`, error);
    throw error; // Re-throw to be caught by calling function
  }
}

// Export functions if you plan to use ES6 modules and a bundler later.
// For now, these will be global or attached to a global object if script tags are used directly.
// Example for direct script usage (no modules):
window.apiService = { storeToken, getToken, removeToken, post, get }; // Add get here
