/**
 * Medicine Routes — /api/medicines
 *
 * GET  /              — public list with ?search, ?category, ?sort, ?page, ?limit
 * GET  /:id           — public single medicine
 * POST /              — admin/pharmacist create
 * PUT  /:id           — admin/pharmacist update
 * DELETE /:id         — admin only delete
 */

const { Router } = require('express');
const medicineController = require('../controllers/medicine.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = Router();

// Public
router.get('/', medicineController.list);
router.get('/:id', medicineController.getById);

// Protected — admin & pharmacist
router.post('/', authenticate, authorize('admin', 'pharmacist'), medicineController.create);
router.put('/:id', authenticate, authorize('admin', 'pharmacist'), medicineController.update);

// Protected — admin only
router.delete('/:id', authenticate, authorize('admin'), medicineController.remove);

module.exports = router;
