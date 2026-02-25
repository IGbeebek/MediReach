/**
 * Medicine Controller — HTTP handlers for /api/medicines
 */

const medicineService = require('../services/medicine.service');
const { success, created } = require('../utils/response');

const medicineController = {
  /**
   * GET /api/medicines
   * Public — list all medicines with optional ?search, ?category, ?sort, ?page, ?limit
   */
  async list(req, res, next) {
    try {
      const { search, category, sort, page, limit } = req.query;
      const result = await medicineService.list({
        search,
        category,
        sort,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
      });
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/medicines/:id
   * Public — get a single medicine by UUID
   */
  async getById(req, res, next) {
    try {
      const medicine = await medicineService.getById(req.params.id);
      return success(res, { medicine });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/medicines
   * Admin / Pharmacist — create a new medicine
   */
  async create(req, res, next) {
    try {
      const medicine = await medicineService.create(req.body);
      return created(res, { medicine }, 'Medicine created');
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/medicines/:id
   * Admin / Pharmacist — update a medicine
   */
  async update(req, res, next) {
    try {
      const medicine = await medicineService.update(req.params.id, req.body);
      return success(res, { medicine }, 'Medicine updated');
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/medicines/:id
   * Admin only — delete a medicine
   */
  async remove(req, res, next) {
    try {
      await medicineService.remove(req.params.id);
      return success(res, null, 'Medicine deleted');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = medicineController;
