/**
 * Cart Controller — HTTP handlers for /api/cart
 */

const cartService = require('../services/cart.service');
const { success } = require('../utils/response');

const cartController = {
  /**
   * GET /api/cart
   * Get the authenticated customer's cart with items + totals.
   */
  async getCart(req, res, next) {
    try {
      const cart = await cartService.getCart(req.user.userId);
      return success(res, { cart });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/cart/items
   * Body: { medicineId, quantity? }
   * Add medicine to cart.
   */
  async addItem(req, res, next) {
    try {
      const { medicineId, quantity } = req.body;
      const cart = await cartService.addItem(
        req.user.userId,
        medicineId,
        quantity || 1
      );
      return success(res, { cart }, 'Item added to cart');
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/cart/items/:medicineId
   * Body: { quantity }
   * Update item quantity.
   */
  async updateItem(req, res, next) {
    try {
      const { medicineId } = req.params;
      const { quantity } = req.body;
      const cart = await cartService.updateItemQuantity(
        req.user.userId,
        medicineId,
        quantity
      );
      return success(res, { cart }, 'Cart updated');
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/cart/items/:medicineId
   * Remove item from cart.
   */
  async removeItem(req, res, next) {
    try {
      const { medicineId } = req.params;
      const cart = await cartService.removeItem(req.user.userId, medicineId);
      return success(res, { cart }, 'Item removed from cart');
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/cart
   * Clear the entire cart.
   */
  async clearCart(req, res, next) {
    try {
      const cart = await cartService.clearCart(req.user.userId);
      return success(res, { cart }, 'Cart cleared');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = cartController;
