/**
 * Order Repository — database queries for orders & order_items tables.
 */

const { query } = require('../database/db');

const orderRepository = {
  /**
   * Generate a unique order number: MR-YYYYMMDD-XXXXX
   */
  async generateOrderNumber() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const { rows } = await query(
      "SELECT COUNT(*) AS cnt FROM orders WHERE order_number LIKE $1",
      [`MR-${date}-%`]
    );
    const seq = String(parseInt(rows[0].cnt, 10) + 1).padStart(5, '0');
    return `MR-${date}-${seq}`;
  },

  /**
   * Create an order (called inside a transaction with a client).
   */
  async createOrder(client, data) {
    const { rows } = await client.query(
      `INSERT INTO orders
         (user_id, order_number, status, subtotal, tax, delivery_fee,
          grand_total, payment_method, payment_status,
          shipping_address, shipping_phone, notes, prescription_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        data.userId,
        data.orderNumber,
        data.status || 'pending',
        data.subtotal,
        data.tax,
        data.deliveryFee,
        data.grandTotal,
        data.paymentMethod,
        data.paymentStatus || 'pending',
        data.shippingAddress,
        data.shippingPhone,
        data.notes || null,
        data.prescriptionId || null,
      ]
    );
    return rows[0];
  },

  /**
   * Bulk insert order items (called inside a transaction with a client).
   */
  async createOrderItems(client, orderId, items) {
    const results = [];
    for (const item of items) {
      const { rows } = await client.query(
        `INSERT INTO order_items
           (order_id, medicine_id, medicine_name, quantity, unit_price, total_price)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING *`,
        [
          orderId,
          item.medicineId,
          item.medicineName,
          item.quantity,
          item.unitPrice,
          item.totalPrice,
        ]
      );
      results.push(rows[0]);
    }
    return results;
  },

  /**
   * Deduct stock for a list of items (called inside a transaction with a client).
   */
  async deductStock(client, items) {
    for (const item of items) {
      await client.query(
        `UPDATE medicines
         SET stock = stock - $1, sold_count = sold_count + $1
         WHERE id = $2 AND stock >= $1`,
        [item.quantity, item.medicineId]
      );
    }
  },

  /**
   * Find an order by ID.
   */
  async findById(id) {
    const { rows } = await query('SELECT * FROM orders WHERE id = $1', [id]);
    return rows[0] || null;
  },

  /**
   * Find an order by order_number.
   */
  async findByOrderNumber(orderNumber) {
    const { rows } = await query(
      'SELECT * FROM orders WHERE order_number = $1',
      [orderNumber]
    );
    return rows[0] || null;
  },

  /**
   * Get order items for an order.
   */
  async getOrderItems(orderId) {
    const { rows } = await query(
      `SELECT oi.*, m.image_url, m.category
       FROM order_items oi
       JOIN medicines m ON m.id = oi.medicine_id
       WHERE oi.order_id = $1
       ORDER BY oi.created_at ASC`,
      [orderId]
    );
    return rows;
  },

  /**
   * Get all orders for a user with pagination.
   */
  async findByUser(userId, { page = 1, limit = 10, status } = {}) {
    const conditions = ['o.user_id = $1'];
    const params = [userId];
    let idx = 2;

    if (status) {
      conditions.push(`o.status = $${idx}`);
      params.push(status);
      idx++;
    }

    const where = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    const [ordersResult, countResult] = await Promise.all([
      query(
        `SELECT o.* FROM orders o
         WHERE ${where}
         ORDER BY o.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset]
      ),
      query(
        `SELECT COUNT(*) AS total FROM orders o WHERE ${where}`,
        params
      ),
    ]);

    return {
      orders: ordersResult.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  },

  /**
   * Get all orders (admin/pharmacist).
   */
  async findAll({ page = 1, limit = 20, status } = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (status) {
      conditions.push(`o.status = $${idx}`);
      params.push(status);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const [ordersResult, countResult] = await Promise.all([
      query(
        `SELECT o.*, u.name AS user_name, u.email AS user_email
         FROM orders o
         JOIN users u ON u.id = o.user_id
         ${where}
         ORDER BY o.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset]
      ),
      query(
        `SELECT COUNT(*) AS total FROM orders o ${where}`,
        params
      ),
    ]);

    return {
      orders: ordersResult.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  },

  /**
   * Update order status.
   */
  async updateStatus(id, status) {
    const { rows } = await query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return rows[0] || null;
  },

  /**
   * Update payment status on an order.
   */
  async updatePaymentStatus(id, paymentStatus) {
    const { rows } = await query(
      'UPDATE orders SET payment_status = $1 WHERE id = $2 RETURNING *',
      [paymentStatus, id]
    );
    return rows[0] || null;
  },

  /**
   * Update the delivery rider's current GPS position.
   */
  async updateDeliveryLocation(id, { lat, lng }) {
    const { rows } = await query(
      'UPDATE orders SET delivery_lat = $1, delivery_lng = $2 WHERE id = $3 RETURNING *',
      [lat, lng, id]
    );
    return rows[0] || null;
  },

  /**
   * Set destination coordinates for the order.
   */
  async setDestination(id, { lat, lng }) {
    const { rows } = await query(
      'UPDATE orders SET destination_lat = $1, destination_lng = $2 WHERE id = $3 RETURNING *',
      [lat, lng, id]
    );
    return rows[0] || null;
  },

  /**
   * Get delivery location data for an order.
   */
  async getTrackingData(id) {
    const { rows } = await query(
      `SELECT id, status, delivery_lat, delivery_lng, destination_lat, destination_lng,
              shipping_address, updated_at
       FROM orders WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },
};

module.exports = orderRepository;
