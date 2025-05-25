const express = require('express');
const router = express.Router();
const { scanUrl } = require('../controllers/scanController');
// const authMiddleware = require('../middleware/authMiddleware'); // To be added later

// @route   POST api/scan
// @desc    Scan a URL
// @access  Private (will be protected by authMiddleware later)
router.post('/', /* authMiddleware, */ scanUrl);

module.exports = router;
