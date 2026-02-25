/**
 * Payment Controller — HTTP handlers for /api/payments
 */

const paymentService = require('../services/payment.service');
const { success } = require('../utils/response');

const paymentController = {
  /* ─────────────────────────────── eSewa ─────────────────────────── */

  /**
   * POST /api/payments/esewa/initiate
   * Body: { orderId }
   * Returns form data for frontend to submit to eSewa.
   */
  async initiateEsewa(req, res, next) {
    try {
      const { orderId } = req.body;
      const result = await paymentService.initiateEsewa(orderId, req.user.userId);
      return success(res, result, 'eSewa payment initiated');
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/payments/esewa/verify
   * Body: { data }  (base64-encoded eSewa response)
   * Verifies the eSewa payment and updates order status.
   */
  async verifyEsewa(req, res, next) {
    try {
      const { data } = req.body;
      const result = await paymentService.verifyEsewa(data);
      return success(res, result, 'eSewa payment verified');
    } catch (err) {
      next(err);
    }
  },

  /* ─────────────────────────────── Khalti ────────────────────────── */

  /**
   * POST /api/payments/khalti/initiate
   * Body: { orderId }
   * Returns Khalti payment URL + pidx.
   */
  async initiateKhalti(req, res, next) {
    try {
      const { orderId } = req.body;
      const result = await paymentService.initiateKhalti(orderId, req.user.userId);
      return success(res, result, 'Khalti payment initiated');
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/payments/khalti/verify
   * Body: { pidx, orderId }
   * Verifies the Khalti payment and updates order status.
   */
  async verifyKhalti(req, res, next) {
    try {
      const { pidx, orderId } = req.body;
      const result = await paymentService.verifyKhalti(pidx, orderId);
      return success(res, result, 'Khalti payment verified');
    } catch (err) {
      next(err);
    }
  },

  /* ─────────────────────────────── Shared ────────────────────────── */

  /**
   * GET /api/payments/order/:orderId
   * Get all payment records for an order.
   */
  async getOrderPayments(req, res, next) {
    try {
      const payments = await paymentService.getOrderPayments(req.params.orderId);
      return success(res, { payments });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = paymentController;
