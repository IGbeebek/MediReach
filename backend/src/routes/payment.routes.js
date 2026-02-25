/**
 * Payment Routes — /api/payments
 *
 * POST   /esewa/initiate       — customer: get eSewa form data
 * POST   /esewa/verify         — customer: verify eSewa callback
 * POST   /khalti/initiate      — customer: get Khalti payment URL
 * POST   /khalti/verify        — customer: verify Khalti callback
 * GET    /order/:orderId       — authenticated: get payment records for order
 */

const { Router } = require('express');
const paymentController = require('../controllers/payment.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const {
  initiatePaymentSchema,
  verifyEsewaSchema,
  verifyKhaltiSchema,
} = require('../validators/cart.validator');

const router = Router();

// All payment routes require authentication
router.use(authenticate);

// eSewa
router.post(
  '/esewa/initiate',
  authorize('customer'),
  validate(initiatePaymentSchema),
  paymentController.initiateEsewa
);
router.post(
  '/esewa/verify',
  authorize('customer'),
  validate(verifyEsewaSchema),
  paymentController.verifyEsewa
);

// Khalti
router.post(
  '/khalti/initiate',
  authorize('customer'),
  validate(initiatePaymentSchema),
  paymentController.initiateKhalti
);
router.post(
  '/khalti/verify',
  authorize('customer'),
  validate(verifyKhaltiSchema),
  paymentController.verifyKhalti
);

// Shared
router.get(
  '/order/:orderId',
  paymentController.getOrderPayments
);

module.exports = router;
