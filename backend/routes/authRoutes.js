const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { check } = require('express-validator'); // Or body
const validationMiddleware = require('../middleware/validationMiddleware');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post(
  '/register',
  [
    check('username', 'Username is required and must be at least 3 characters long').not().isEmpty().trim().isLength({ min: 3 }),
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password is required and must be at least 6 characters long').isLength({ min: 6 }),
    // You could add a custom validator for password confirmation if 'confirmPassword' is sent in body:
    // check('confirmPassword').custom((value, { req }) => {
    //   if (value !== req.body.password) {
    //     throw new Error('Passwords do not match');
    //   }
    //   return true;
    // })
  ],
  validationMiddleware, // Middleware to handle validation errors
  registerUser
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token (Login)
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password is required').exists().not().isEmpty(),
  ],
  validationMiddleware, // Middleware to handle validation errors
  loginUser
);

module.exports = router;
