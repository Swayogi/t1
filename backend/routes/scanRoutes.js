const express = require('express');
const router = express.Router();
const { scanUrl, getScanById } = require('../controllers/scanController'); // Add getScanById
const authMiddleware = require('../middleware/authMiddleware'); // Ensure this is imported

// @route   POST api/scan
// @desc    Scan a URL
// @access  Private
router.post('/', authMiddleware, scanUrl); // Protected by authMiddleware

// @route   GET api/scan/:id
// @desc    Get a specific scan by its ID
// @access  Private
router.get('/:id', authMiddleware, getScanById);

module.exports = router;
