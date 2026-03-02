const { Router } = require('express');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadPrescription } = require('../middlewares/upload');
const prescriptionController = require('../controllers/prescription.controller');

const router = Router();

// ── Customer routes ──────────────────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  authorize('customer'),
  uploadPrescription,
  prescriptionController.upload
);

router.get(
  '/my',
  authenticate,
  authorize('customer'),
  prescriptionController.getMine
);

router.get(
  '/approved',
  authenticate,
  authorize('customer'),
  prescriptionController.getApproved
);

// ── Pharmacist / Admin routes ────────────────────────────────────────────────
router.get(
  '/',
  authenticate,
  authorize('pharmacist', 'admin'),
  prescriptionController.getAll
);

router.get(
  '/:id',
  authenticate,
  prescriptionController.getOne
);

router.patch(
  '/:id/review',
  authenticate,
  authorize('pharmacist', 'admin'),
  prescriptionController.review
);

module.exports = router;
