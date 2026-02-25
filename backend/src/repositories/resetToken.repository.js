const { query } = require('../database/db');

/**
 * Password Reset Token Repository.
 */

const resetTokenRepository = {
  /**
   * Store a new password reset token.
   */
  async create({ userId, token, expiresAt }) {
    // Invalidate any existing unused tokens for this user first
    await query(
      `UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE`,
      [userId]
    );

    const sql = `
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const { rows } = await query(sql, [userId, token, expiresAt]);
    return rows[0];
  },

  /**
   * Find a valid (unused, not expired) reset token.
   */
  async findValidToken(token) {
    const sql = `
      SELECT * FROM password_reset_tokens
      WHERE token = $1 AND used = FALSE AND expires_at > NOW()
    `;
    const { rows } = await query(sql, [token]);
    return rows[0] || null;
  },

  /**
   * Mark token as used.
   */
  async markUsed(id) {
    const sql = `UPDATE password_reset_tokens SET used = TRUE WHERE id = $1`;
    await query(sql, [id]);
  },
};

module.exports = resetTokenRepository;
