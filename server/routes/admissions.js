const express = require('express');
const router = express.Router();
const Admission = require('../models/Admission');
const { protect, adminOnly } = require('../middleware/auth');

// @GET /api/admissions — admin gets all, student gets own
router.get('/', protect, async (req, res) => {
  try {
    let admissions;
    if (req.user.role === 'admin') {
      admissions = await Admission.find().sort({ createdAt: -1 });
    } else {
      admissions = await Admission.find({ email: req.user.email }).sort({ createdAt: -1 });
    }
    res.json(admissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/admissions — student submits application
router.post('/', protect, async (req, res) => {
  try {
    const existing = await Admission.findOne({ email: req.user.email });
    if (existing) return res.status(400).json({ message: 'You already have a submitted application.' });

    const admission = await Admission.create({ ...req.body, email: req.user.email, submittedBy: req.user._id });
    res.status(201).json(admission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/admissions/:id — admin updates status, notes, AI data
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const admission = await Admission.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!admission) return res.status(404).json({ message: 'Application not found' });
    res.json(admission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @DELETE /api/admissions/:id — admin deletes application
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Admission.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
