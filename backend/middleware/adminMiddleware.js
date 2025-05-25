module.exports = function(req, res, next) {
  // authMiddleware should have already populated req.user and its role
  if (req.user && req.user.role === 'admin') {
    next(); // User is an admin, proceed
  } else {
    // If req.user is not present, or role is not admin
    res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
  }
};
