const User = require('../models/User');
const Report = require('../models/Report');
const Scan = require('../models/Scan'); // For potential future admin features related to scans

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error when fetching users');
  }
};

// @desc    Get a single user by ID (Admin)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found (invalid ID format)' });
    }
    res.status(500).send('Server Error when fetching user');
  }
};

// @desc    Update user (e.g., isAdmin, or other properties) (Admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  const { username, email, isAdmin } = req.body; // Add other fields as necessary
  
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update fields if they are provided
    if (username) user.username = username;
    if (email) user.email = email;
    if (typeof isAdmin === 'boolean') user.isAdmin = isAdmin;
    // Add more updatable fields here, e.g., isBlocked

    await user.save();
    res.json(user);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error when updating user');
  }
};

// @desc    Get all reports (Admin)
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().populate('reporterUser', ['username', 'email']); // Populate reporter info
    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error when fetching reports');
  }
};

// @desc    Get a single report by ID (Admin)
// @route   GET /api/admin/reports/:id
// @access  Private/Admin
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('reporterUser', ['username', 'email']);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }
    res.json(report);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Report not found (invalid ID format)' });
    }
    res.status(500).send('Server Error when fetching report');
  }
};

// @desc    Update report status or add admin notes (Admin)
// @route   PUT /api/admin/reports/:id
// @access  Private/Admin
exports.updateReport = async (req, res) => {
  const { status, adminNotes } = req.body;
  try {
    let report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    if (status) report.status = status;
    if (adminNotes) report.adminNotes = adminNotes;

    await report.save();
    res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error when updating report');
  }
};
