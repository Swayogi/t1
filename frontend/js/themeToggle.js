// frontend/js/themeToggle.js
document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('themeToggle');
  const currentTheme = localStorage.getItem('phishNetTheme');
  const bodyElement = document.body;

  // Apply saved theme on initial load
  if (currentTheme) {
    bodyElement.classList.add(currentTheme); // Assumes saved theme is 'dark-mode' or ''
    // Update button text/icon if needed based on currentTheme
    if (themeToggleBtn && currentTheme === 'dark-mode') {
      // Example: themeToggleBtn.textContent = 'Switch to Light Mode';
    }
  } else {
    // Default to light mode if no preference saved, or check system preference
    // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // if (prefersDark) {
    //    bodyElement.classList.add('dark-mode');
    //    localStorage.setItem('phishNetTheme', 'dark-mode');
    // }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      bodyElement.classList.toggle('dark-mode');

      // Save preference to localStorage
      if (bodyElement.classList.contains('dark-mode')) {
        localStorage.setItem('phishNetTheme', 'dark-mode');
        // Example: themeToggleBtn.textContent = 'Switch to Light Mode';
      } else {
        localStorage.removeItem('phishNetTheme'); // Or set to 'light-mode'
        // Example: themeToggleBtn.textContent = 'Switch to Dark Mode';
      }
    });
  } else {
    console.warn('Theme toggle button with ID "themeToggle" not found.');
  }
});
