const { query } = require('../database/db');

/**
 * User Repository — all direct database access for the users table.
 */

const userRepository = {
  /**
   * Create a new user (local email/password).
   */
  async create({ name, email, password, role = 'customer', phone = null, address = null }) {
    const sql = `
      INSERT INTO users (name, email, password, role, phone, address, auth_provider)
      VALUES ($1, $2, $3, $4, $5, $6, 'local')
      RETURNING id, name, email, role, status, phone, address, auth_provider, avatar_url, created_at, updated_at
    `;
    const { rows } = await query(sql, [name, email, password, role, phone, address]);
    return rows[0];
  },

  /**
   * Create or find a user via OAuth provider (Google / Apple).
   * If a user with the same email already exists, update their provider info and return them.
   */
  async findOrCreateOAuth({ email, name, authProvider, providerId, avatarUrl = null }) {
    // Check if user exists by email
    const existing = await this.findByEmail(email);

    if (existing) {
      // Link provider if not already linked
      if (existing.auth_provider === 'local' || existing.auth_provider !== authProvider) {
        const sql = `
          UPDATE users
          SET auth_provider = $1, provider_id = $2, avatar_url = COALESCE($3, avatar_url)
          WHERE id = $4
          RETURNING id, name, email, role, status, phone, address, auth_provider, avatar_url, created_at, updated_at
        `;
        const { rows } = await query(sql, [authProvider, providerId, avatarUrl, existing.id]);
        return { user: rows[0], isNew: false };
      }
      const { password: _, ...safeUser } = existing;
      return { user: safeUser, isNew: false };
    }

    // Create new OAuth user (no password)
    const sql = `
      INSERT INTO users (name, email, role, auth_provider, provider_id, avatar_url)
      VALUES ($1, $2, 'customer', $3, $4, $5)
      RETURNING id, name, email, role, status, phone, address, auth_provider, avatar_url, created_at, updated_at
    `;
    const { rows } = await query(sql, [name, email, authProvider, providerId, avatarUrl]);
    return { user: rows[0], isNew: true };
  },

  /**
   * Find user by email (includes password hash for login verification).
   */
  async findByEmail(email) {
    const sql = `SELECT * FROM users WHERE email = $1`;
    const { rows } = await query(sql, [email]);
    return rows[0] || null;
  },

  /**
   * Find user by id (excludes password).
   */
  async findById(id) {
    const sql = `
      SELECT id, name, email, role, status, phone, address, created_at, updated_at
      FROM users WHERE id = $1
    `;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  },

  /**
   * Find user by id (includes password — use only for password operations).
   */
  async findByIdWithPassword(id) {
    const sql = `SELECT * FROM users WHERE id = $1`;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  },

  /**
   * Update user's password.
   */
  async updatePassword(id, hashedPassword) {
    const sql = `UPDATE users SET password = $1 WHERE id = $2 RETURNING id`;
    const { rows } = await query(sql, [hashedPassword, id]);
    return rows[0] || null;
  },

  /**
   * Update user profile fields.
   */
  async updateProfile(id, { name, phone, address }) {
    const sql = `
      UPDATE users SET name = COALESCE($1, name),
                       phone = COALESCE($2, phone),
                       address = COALESCE($3, address)
      WHERE id = $4
      RETURNING id, name, email, role, status, phone, address, created_at, updated_at
    `;
    const { rows } = await query(sql, [name, phone, address, id]);
    return rows[0] || null;
  },

  /**
   * Update user status (active / blocked).
   */
  async updateStatus(id, status) {
    const sql = `
      UPDATE users SET status = $1 WHERE id = $2
      RETURNING id, name, email, role, status, created_at, updated_at
    `;
    const { rows } = await query(sql, [status, id]);
    return rows[0] || null;
  },

  /**
   * Get all users (admin).
   */
  async findAll({ page = 1, limit = 20, role, status }) {
    let sql = `
      SELECT id, name, email, role, status, phone, address, created_at, updated_at
      FROM users WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (role) {
      sql += ` AND role = $${idx++}`;
      params.push(role);
    }
    if (status) {
      sql += ` AND status = $${idx++}`;
      params.push(status);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(limit, (page - 1) * limit);

    const { rows } = await query(sql, params);
    return rows;
  },

  /**
   * Count users with optional filters.
   */
  async count({ role, status } = {}) {
    let sql = `SELECT COUNT(*)::int AS total FROM users WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (role) {
      sql += ` AND role = $${idx++}`;
      params.push(role);
    }
    if (status) {
      sql += ` AND status = $${idx++}`;
      params.push(status);
    }

    const { rows } = await query(sql, params);
    return rows[0].total;
  },

  /**
   * Delete a user by id.
   */
  async deleteById(id) {
    const sql = `DELETE FROM users WHERE id = $1 RETURNING id, name, email, role`;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  },
};

module.exports = userRepository;
