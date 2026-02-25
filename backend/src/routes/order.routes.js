/**
 * Order Routes — /api/orders
 *
 * POST   /checkout      — customer: convert cart → order
 * GET    /my            — customer: list own orders
 * GET    /:id           — any authenticated: get single order
 * GET    /              — admin/pharmacist: list all orders
 * PATCH  /:id/status    — admin/pharmacist: update order status
 * POST   /:id/cancel    — customer: cancel own order
 */

const { Router } = require('express');
const orderController = require('../controllers/order.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { checkoutSchema } = require('../validators/cart.validator');

const router = Router();

// All order routes require authentication
router.use(authenticate);

// Customer routes
router.post(
  '/checkout',
  authorize('customer'),
  validate(checkoutSchema),
  orderController.checkout
);

router.get('/my', authorize('customer'), orderController.getMyOrders);

router.post(
  '/:id/cancel',
  authorize('customer'),
  orderController.cancelOrder
);

// Admin / pharmacist routes
router.get(
  '/',
  authorize('admin', 'pharmacist'),
  orderController.getAllOrders
);

router.patch(
  '/:id/status',
  authorize('admin', 'pharmacist'),
  orderController.updateStatus
);

// Shared — any authenticated user (authorization handled in service)
router.get('/:id', orderController.getOrder);

module.exports = router;
