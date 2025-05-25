const express = require('express');
const router = express.Router();
const { 
    getAllUsers, 
    getUserById, 
    updateUser,
    getAllReports, 
    getReportById,
    updateReport 
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// User Management Routes
router.get('/users', [authMiddleware, adminMiddleware], getAllUsers);
router.get('/users/:id', [authMiddleware, adminMiddleware], getUserById);
router.put('/users/:id', [authMiddleware, adminMiddleware], updateUser);
// Add DELETE /users/:id later if needed

// Report Management Routes
router.get('/reports', [authMiddleware, adminMiddleware], getAllReports);
router.get('/reports/:id', [authMiddleware, adminMiddleware], getReportById);
router.put('/reports/:id', [authMiddleware, adminMiddleware], updateReport);
// Add DELETE /reports/:id later if needed

module.exports = router;
