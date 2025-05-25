const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
// JWT_SECRET should be in an environment variable and is loaded by dotenv
const JWT_SECRET = process.env.JWT_SECRET || 'yourJwtSecret'; // Fallback for safety

module.exports = async function(req, res, next) {
  // Get token from header (e.g., 'x-auth-token' or 'Authorization: Bearer TOKEN')
  const authHeader = req.header('Authorization');
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7, authHeader.length); // Extract token from "Bearer TOKEN"
  } else if (req.header('x-auth-token')) {
    token = req.header('x-auth-token');
  }
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user; // Add user from payload to request object

    // Optionally: Fetch the full user object from DB to ensure it's still valid/exists
    // const user = await User.findById(req.user.id).select('-password');
    // if (!user) {
    //   return res.status(401).json({ msg: 'User not found, authorization denied' });
    // }
    // req.user = user; // Replace payload with full user object

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
