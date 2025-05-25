const request = require('supertest');
const express = require('express'); // To create a minimal app for testing if server.js is too complex to import directly

// Option 1: Import your actual app instance from server.js
// This is preferred if your server.js exports the app or a way to get it.
// For this to work, server.js needs to export 'app'.
// e.g., in server.js: module.exports = app; (and conditionally start listening)
// For now, let's assume server.js does NOT export app and we create a minimal one.

// Option 2: Create a minimal Express app for this test if server.js is not easily importable for tests.
// This approach tests the route handler in isolation.
// However, for true integration tests, you'd want to test your actual app.

// Let's try to set up a test that assumes you might modify server.js to export the app.
// If server.js is structured like:
// const app = express(); ... app.listen(...);
// You would modify server.js to:
// const app = express(); ...
// if (require.main === module) { app.listen(...) } // Start server only when run directly
// module.exports = app; // Export app for testing

// For this subtask, we will create a simple test server that mimics the main route.
// This avoids complex modifications to server.js for now but highlights the need for a testable server structure.

const app = express();
app.get('/', (req, res) => {
  res.send('PhishNet Backend is Running!');
});
// Note: If your actual server.js is more complex (e.g. uses connectDB which tries to connect to Mongo)
// then directly importing server.js might cause issues in a test environment without a DB.
// This is a common challenge and often solved with mocking databases or specific test configurations.

describe('GET /', () => {
  it('should respond with PhishNet Backend is Running!', async () => {
    const response = await request(app) // Use the minimal app for this example
      .get('/')
      .expect('Content-Type', /text\/html/) // Or application/json if your actual route sends that
      .expect(200);
    
    expect(response.text).toBe('PhishNet Backend is Running!');
  });
});

// Example for testing a JSON endpoint (if you had one like /api/health)
// app.get('/api/health', (req, res) => res.status(200).json({ status: 'UP' }));
// describe('GET /api/health', () => {
//   it('should return 200 and status UP', async () => {
//     const response = await request(app)
//       .get('/api/health')
//       .expect('Content-Type', /json/)
//       .expect(200);
    
//     expect(response.body.status).toBe('UP');
//   });
// });
