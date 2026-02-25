/**
 * Payment Repository — database queries for the payments table.
 */

const { query } = require('../database/db');

const paymentRepository = {
  /**
   * Create a payment record.
   */
  async create(data) {
    const { rows } = await query(
      `INSERT INTO payments
         (order_id, method, amount, status, transaction_id,
          provider_ref, provider_response, idempotency_key)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        data.orderId,
        data.method,
        data.amount,
        data.status || 'pending',
        data.transactionId || null,
        data.providerRef || null,
        data.providerResponse ? JSON.stringify(data.providerResponse) : null,
        data.idempotencyKey || null,
      ]
    );
    return rows[0];
  },

  /**
   * Find payment by ID.
   */
  async findById(id) {
    const { rows } = await query('SELECT * FROM payments WHERE id = $1', [id]);
    return rows[0] || null;
  },

  /**
   * Find payment(s) for an order.
   */
  async findByOrderId(orderId) {
    const { rows } = await query(
      'SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC',
      [orderId]
    );
    return rows;
  },

  /**
   * Find by idempotency key (prevent duplicate payments).
   */
  async findByIdempotencyKey(key) {
    const { rows } = await query(
      'SELECT * FROM payments WHERE idempotency_key = $1',
      [key]
    );
    return rows[0] || null;
  },

  /**
   * Find by transaction_id (for provider callback verification).
   */
  async findByTransactionId(txnId) {
    const { rows } = await query(
      'SELECT * FROM payments WHERE transaction_id = $1',
      [txnId]
    );
    return rows[0] || null;
  },

  /**
   * Update payment status and provider data.
   */
  async updateStatus(id, { status, transactionId, providerRef, providerResponse }) {
    const fields = ['status = $1'];
    const params = [status];
    let idx = 2;

    if (transactionId !== undefined) {
      fields.push(`transaction_id = $${idx}`);
      params.push(transactionId);
      idx++;
    }
    if (providerRef !== undefined) {
      fields.push(`provider_ref = $${idx}`);
      params.push(providerRef);
      idx++;
    }
    if (providerResponse !== undefined) {
      fields.push(`provider_response = $${idx}`);
      params.push(JSON.stringify(providerResponse));
      idx++;
    }

    params.push(id);
    const { rows } = await query(
      `UPDATE payments SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    return rows[0] || null;
  },
};

module.exports = paymentRepository;
