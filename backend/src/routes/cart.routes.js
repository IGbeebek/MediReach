/**
 * Cart Routes — /api/cart
 *
 * GET    /                   — get cart with items & totals
 * POST   /items              — add item to cart
 * PUT    /items/:medicineId  — update item quantity
 * DELETE /items/:medicineId  — remove item from cart
 * DELETE /                   — clear cart
 */

const { Router } = require('express');
const cartController = require('../controllers/cart.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const {
  addToCartSchema,
  updateCartItemSchema,
} = require('../validators/cart.validator');

const router = Router();

// All cart routes require authentication + customer role
router.use(authenticate, authorize('customer'));

router.get('/', cartController.getCart);
router.post('/items', validate(addToCartSchema), cartController.addItem);
router.put('/items/:medicineId', validate(updateCartItemSchema), cartController.updateItem);
router.delete('/items/:medicineId', cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;
