const { query } = require('../database/db');

/**
 * Refresh Token Repository — all direct database access for the refresh_tokens table.
 */

const tokenRepository = {
  /**
   * Store a new refresh token.
   */
  async create({ userId, token, expiresAt, ipAddress = null, userAgent = null }) {
    const sql = `
      INSERT INTO refresh_tokens (user_id, token, expires_at, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const { rows } = await query(sql, [userId, token, expiresAt, ipAddress, userAgent]);
    return rows[0];
  },

  /**
   * Find a refresh token row by the raw JWT string.
   */
  async findByToken(token) {
    const sql = `SELECT * FROM refresh_tokens WHERE token = $1`;
    const { rows } = await query(sql, [token]);
    return rows[0] || null;
  },

  /**
   * Revoke a token by its id and optionally record which token replaced it.
   */
  async revoke(id, replacedById = null) {
    const sql = `
      UPDATE refresh_tokens SET revoked = TRUE, replaced_by = $1 WHERE id = $2
      RETURNING *
    `;
    const { rows } = await query(sql, [replacedById, id]);
    return rows[0] || null;
  },

  /**
   * Revoke ALL refresh tokens for a given user (logout from all devices).
   */
  async revokeAllForUser(userId) {
    const sql = `UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1 AND revoked = FALSE`;
    await query(sql, [userId]);
  },

  /**
   * Delete expired tokens (housekeeping).
   */
  async deleteExpired() {
    const sql = `DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked = TRUE`;
    const result = await query(sql);
    return result.rowCount;
  },
};

module.exports = tokenRepository;
