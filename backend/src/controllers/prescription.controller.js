/**
 * Prescription Controller — HTTP handlers for prescription endpoints.
 */
const prescriptionService = require('../services/prescription.service');
const { success, created } = require('../utils/response');

const prescriptionController = {
  /**
   * POST /api/prescriptions  — customer uploads a prescription image.
   */
  async upload(req, res, next) {
    try {
      const rx = await prescriptionService.upload(req.user.userId, req.file, req.body.notes);
      return created(res, { prescription: rx }, 'Prescription uploaded successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/prescriptions/my  — customer fetches own prescriptions.
   */
  async getMine(req, res, next) {
    try {
      const list = await prescriptionService.getMyPrescriptions(req.user.userId);
      return success(res, { prescriptions: list });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/prescriptions/approved  — customer gets approved prescriptions (for checkout).
   */
  async getApproved(req, res, next) {
    try {
      const list = await prescriptionService.getApproved(req.user.userId);
      return success(res, { prescriptions: list });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/prescriptions  — pharmacist/admin lists all prescriptions (?status=pending).
   */
  async getAll(req, res, next) {
    try {
      const list = await prescriptionService.getAll(req.query.status);
      return success(res, { prescriptions: list });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/prescriptions/:id  — view a single prescription.
   */
  async getOne(req, res, next) {
    try {
      const rx = await prescriptionService.getById(req.params.id, req.user.userId, req.user.role);
      return success(res, { prescription: rx });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/prescriptions/:id/review  — pharmacist/admin approves or rejects.
   */
  async review(req, res, next) {
    try {
      const rx = await prescriptionService.review(req.params.id, req.user.userId, {
        status: req.body.status,
        notes: req.body.notes,
      });
      return success(res, { prescription: rx }, `Prescription ${rx.status}`);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = prescriptionController;
