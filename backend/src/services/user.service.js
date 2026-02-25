const userRepository = require('../repositories/user.repository');
const tokenRepository = require('../repositories/token.repository');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Admin-specific user management service.
 */

const userService = {
  /**
   * List all users with pagination and optional filters.
   */
  async listUsers({ page = 1, limit = 20, role, status }) {
    const [users, total] = await Promise.all([
      userRepository.findAll({ page, limit, role, status }),
      userRepository.count({ role, status }),
    ]);
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Block or unblock a user account.
   */
  async setUserStatus(userId, status) {
    if (!['active', 'blocked'].includes(status)) {
      throw new BadRequestError('Status must be "active" or "blocked"');
    }
    const user = await userRepository.updateStatus(userId, status);
    if (!user) throw new NotFoundError('User not found');

    // If blocking, revoke all their sessions
    if (status === 'blocked') {
      await tokenRepository.revokeAllForUser(userId);
    }

    return user;
  },

  /**
   * Get single user by ID.
   */
  async getUserById(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  },
};

module.exports = userService;
