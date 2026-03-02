/**
 * Prescription Repository — database queries for prescriptions table.
 */
const { query } = require('../database/db');

const prescriptionRepository = {
  /**
   * Create a prescription record.
   */
  async create({ userId, imageUrl, notes }) {
    const { rows } = await query(
      `INSERT INTO prescriptions (user_id, image_url, notes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, imageUrl, notes || null]
    );
    return rows[0];
  },

  /**
   * Find a single prescription by ID.
   */
  async findById(id) {
    const { rows } = await query('SELECT * FROM prescriptions WHERE id = $1', [id]);
    return rows[0] || null;
  },

  /**
   * Get all prescriptions for a specific user (newest first).
   */
  async findByUserId(userId) {
    const { rows } = await query(
      `SELECT p.*, u.name AS reviewed_by_name
       FROM prescriptions p
       LEFT JOIN users u ON u.id = p.reviewed_by
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );
    return rows;
  },

  /**
   * Get all prescriptions (optionally filtered by status). 
   * Includes the customer's name.
   */
  async findAll(status) {
    let sql = `
      SELECT p.*,
             cu.name  AS customer_name,
             cu.email AS customer_email,
             ru.name  AS reviewed_by_name
      FROM prescriptions p
      JOIN users cu ON cu.id = p.user_id
      LEFT JOIN users ru ON ru.id = p.reviewed_by
    `;
    const params = [];
    if (status) {
      sql += ' WHERE p.status = $1';
      params.push(status);
    }
    sql += ' ORDER BY p.created_at DESC';
    const { rows } = await query(sql, params);
    return rows;
  },

  /**
   * Update a prescription's status (approve / reject).
   */
  async updateStatus(id, { status, notes, reviewedBy }) {
    const { rows } = await query(
      `UPDATE prescriptions
       SET status = $1, notes = COALESCE($2, notes), reviewed_by = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, notes, reviewedBy, id]
    );
    return rows[0] || null;
  },

  /**
   * Get approved prescriptions for a user (for linking to orders).
   */
  async findApprovedByUserId(userId) {
    const { rows } = await query(
      `SELECT * FROM prescriptions
       WHERE user_id = $1 AND status = 'approved'
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  },
};

module.exports = prescriptionRepository;
