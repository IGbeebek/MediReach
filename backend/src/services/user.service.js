const userRepository = require('../repositories/user.repository');
const tokenRepository = require('../repositories/token.repository');
const bcrypt = require('bcrypt');
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

  /**
   * Admin creates a pharmacist account.
   */
  async createPharmacist({ name, email, password, phone, address }) {
    if (!name || !email || !password) {
      throw new BadRequestError('Name, email, and password are required');
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) throw new BadRequestError('Email already in use');

    const hashed = await bcrypt.hash(password, 12);
    const user = await userRepository.create({
      name,
      email,
      password: hashed,
      role: 'pharmacist',
      phone: phone || null,
      address: address || null,
    });
    return user;
  },

  /**
   * Delete a user by ID (admin).
   */
  async deleteUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    if (user.role === 'admin') throw new BadRequestError('Cannot delete an admin user');

    // Revoke all sessions first
    await tokenRepository.revokeAllForUser(userId);
    const deleted = await userRepository.deleteById(userId);
    return deleted;
  },
};

module.exports = userService;
