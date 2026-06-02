const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  applicationNumber: { type: String, unique: true },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  stream: { type: String, required: true },
  branches: { type: [String], required: true },
  finalBranch: { type: String },
  twelfthBoard: { type: String, required: true },
  twelfthPercentage: { type: Number, required: true, min: 0, max: 100 },
  tenthPercentage: { type: Number, required: true, min: 0, max: 100 },
  category: { type: String, enum: ['General', 'OBC-NCL', 'SC', 'ST', 'EWS'], required: true },
  entranceExam: { type: String, default: 'None' },
  entranceScore: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  adminNotes: { type: String, default: '' },
  aiScore: { type: Number },
  aiReason: { type: String },
  aiCompliance: { type: String },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Auto-generate application number before saving
admissionSchema.pre('save', function (next) {
  if (!this.applicationNumber) {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.applicationNumber = `AN-${year}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Admission', admissionSchema);
