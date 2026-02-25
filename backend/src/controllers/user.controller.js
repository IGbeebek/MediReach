const userService = require('../services/user.service');
const { success } = require('../utils/response');

/**
 * User Controller — admin-only user management endpoints.
 */

const userController = {
  // ──────────────────────────────────────── GET /api/users
  async listUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
      const { role, status } = req.query;

      const result = await userService.listUsers({ page, limit, role, status });
      return success(res, result, 'Users retrieved');
    } catch (err) {
      next(err);
    }
  },

  // ──────────────────────────────────────── GET /api/users/:id
  async getUser(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return success(res, { user }, 'User retrieved');
    } catch (err) {
      next(err);
    }
  },

  // ──────────────────────────────────────── PATCH /api/users/:id/status
  async updateUserStatus(req, res, next) {
    try {
      const { status } = req.body;
      const user = await userService.setUserStatus(req.params.id, status);
      return success(res, { user }, `User ${status === 'blocked' ? 'blocked' : 'activated'} successfully`);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = userController;
