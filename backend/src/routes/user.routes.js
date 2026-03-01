const { Router } = require('express');
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = Router();

// All routes below require admin role
router.use(authenticate, authorize('admin'));

router.get('/', userController.listUsers);
router.get('/:id', userController.getUser);
router.post('/pharmacist', userController.createPharmacist);
router.patch('/:id/status', userController.updateUserStatus);
router.delete('/:id', userController.deleteUser);

module.exports = router;
