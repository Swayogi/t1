// Centralized Error Handler
// This middleware should be placed last in the middleware stack in server.js

const errorHandlerMiddleware = (err, req, res, next) => {
  console.error("ERROR STACK:", err.stack); // Log the error stack for debugging

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  // If res.statusCode is already set (and not 200), use it, otherwise default to 500 if err.statusCode isn't set.

  res.status(statusCode);

  res.json({
    title: err.message || 'Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
    // Optionally, include stack trace in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    // You can add a custom error code or more details if needed
    // errorCode: err.errorCode
  });
};

module.exports = errorHandlerMiddleware;
