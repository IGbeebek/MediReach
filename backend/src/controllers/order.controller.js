/**
 * Order Controller — HTTP handlers for /api/orders
 */

const orderService = require('../services/order.service');
const { success, created } = require('../utils/response');

const orderController = {
  /**
   * POST /api/orders/checkout
   * Convert cart → order.
   */
  async checkout(req, res, next) {
    try {
      const order = await orderService.checkout(req.user.userId, req.body);
      return created(res, { order }, 'Order placed successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/orders/my
   * Get authenticated customer's orders.
   */
  async getMyOrders(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const result = await orderService.getMyOrders(req.user.userId, {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        status,
      });
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/orders/:id
   * Get a single order by ID.
   */
  async getOrder(req, res, next) {
    try {
      const order = await orderService.getOrderById(
        req.params.id,
        req.user.userId,
        req.user.role
      );
      return success(res, { order });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/orders
   * Admin / pharmacist: get all orders.
   */
  async getAllOrders(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const result = await orderService.getAllOrders({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        status,
      });
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/orders/:id/status
   * Admin / pharmacist: update order status.
   */
  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(req.params.id, status);
      return success(res, { order }, 'Order status updated');
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/orders/:id/cancel
   * Customer: cancel own order.
   */
  async cancelOrder(req, res, next) {
    try {
      const order = await orderService.cancelOrder(
        req.params.id,
        req.user.userId
      );
      return success(res, { order }, 'Order cancelled');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = orderController;
