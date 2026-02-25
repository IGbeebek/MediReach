const { Router } = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const medicineRoutes = require('./medicine.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const paymentRoutes = require('./payment.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/medicines', medicineRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'MediReach API is running', timestamp: new Date().toISOString() });
});

module.exports = router;
