const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user instance
    user = new User({
      email,
      password,
    });

    // Save user to database (password hashing is handled by pre-save hook in User model)
    await user.save();

    // Create and return JWT (payload, secret, options)
    const payload = {
      user: {
        id: user.id, // Mongoose uses 'id' as a virtual getter for '_id'
        role: user.role, // Add role
      },
    };

    // Sign the token
    // Replace 'yourJwtSecret' with an actual secret, preferably from environment variables
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'yourJwtSecret', // Fallback for safety
      { expiresIn: 3600 }, // Expires in 1 hour (3600 seconds)
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Validate password using the matchPassword method from User model
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' }); // Use a generic message for security
    }

    // Create and return JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role, // Add role
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'yourJwtSecret', // Fallback for safety
      { expiresIn: 3600 }, // Expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
