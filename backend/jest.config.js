module.exports = {
  testEnvironment: 'node', // Use Node.js environment for testing
  coveragePathIgnorePatterns: [ // Optional: folders/files to ignore in coverage reports
    '/node_modules/'
  ],
  // Automatically clear mock calls and instances between every test
  clearMocks: true, 
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['json', 'text', 'lcov', 'clover'],
  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/__tests__/**/*.js?(x)', // Looks for .js or .jsx files in any __tests__ folder
    '**/?(*.)+(spec|test).js?(x)' // Looks for files with .spec.js, .test.js, .spec.jsx, or .test.jsx extensions
  ],
  // Setup file to run before each test suite (optional, but good for global setup)
  // setupFilesAfterEnv: ['./tests/setup.js'], // Example, if you create a setup file
};
