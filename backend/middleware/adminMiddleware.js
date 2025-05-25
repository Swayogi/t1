const User = require('../models/User'); // Assuming User model can be fetched to check isAdmin status

module.exports = async function(req, res, next) {
  // This middleware should run AFTER authMiddleware, so req.user should be populated.
  if (!req.user || !req.user.id) {
    return res.status(401).json({ msg: 'User not authenticated, cannot check admin status.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ msg: 'User not found, admin authorization denied.' });
    }

    if (user.isAdmin) {
      next(); // User is admin, proceed
    } else {
      res.status(403).json({ msg: 'User is not an admin, access denied.' });
    }
  } catch (err) {
    console.error('Error in adminMiddleware:', err.message);
    res.status(500).send('Server error during admin authorization.');
  }
};
