// frontend/js/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
  // Ensure apiService.js is loaded and window.apiService is available
  if (!window.apiService || typeof window.apiService.getToken !== 'function') {
    console.error('ApiService not available or getToken is missing. Ensure js/apiService.js is loaded correctly.');
    // Optionally, redirect to login as a fallback if apiService is critical and missing
    // window.location.href = 'login.html'; 
    return;
  }

  const token = window.apiService.getToken();

  if (!token) {
    // No token found, redirect to login page
    alert('You are not logged in. Redirecting to login page...'); // Optional alert
    window.location.href = 'login.html';
  } else {
    // Token exists, user is presumably logged in.
    // Future TODO: Optionally, you could verify the token with a backend endpoint here
    // to ensure it's still valid. For now, just checking existence is the basic step.
    console.log('User is logged in. Token:', token);
    // You can now proceed to fetch dashboard data or enable dashboard features.
    // Example: display username or fetch user-specific data
    // loadDashboardData(token); 
  }
});

// Example function to be called if user is logged in
// async function loadDashboardData(token) {
//   try {
//     // Replace with an actual API call to get user data or dashboard stats
//     // const userData = await window.apiService.get('/user/profile'); // Assuming a GET method in apiService
//     // document.getElementById('usernameDisplay').textContent = userData.username;
//     console.log("Dashboard data would be loaded here.");
//   } catch (error) {
//     console.error("Failed to load dashboard data:", error);
//     // Handle error, maybe redirect to login if token is invalid (e.g., 401 error from API)
//     if (error.response && error.response.status === 401) {
//         window.apiService.removeToken(); // Remove invalid token
//         alert('Your session has expired. Please login again.');
//         window.location.href = 'login.html';
//     }
//   }
// }
