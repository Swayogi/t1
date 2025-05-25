const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reporterUser: { // User who submitted the report
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reportedUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  status: { // e.g., 'Pending', 'Reviewed', 'Resolved', 'FalsePositive'
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Reviewed', 'Resolved', 'FalsePositive', 'Ignored'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  adminNotes: { // Notes added by an admin during review
    type: String,
    required: false,
  }
});

module.exports = mongoose.model('Report', ReportSchema);
