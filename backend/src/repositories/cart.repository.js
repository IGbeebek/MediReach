/**
 * Cart Repository — database queries for carts & cart_items tables.
 */

const { query, getClient } = require('../database/db');

const cartRepository = {
  /**
   * Get or create a cart for a user (each customer has exactly one cart).
   */
  async getOrCreateCart(userId) {
    // Try to find existing
    let { rows } = await query('SELECT * FROM carts WHERE user_id = $1', [userId]);
    if (rows[0]) return rows[0];

    // Create new cart
    ({ rows } = await query(
      'INSERT INTO carts (user_id) VALUES ($1) RETURNING *',
      [userId]
    ));
    return rows[0];
  },

  /**
   * Get cart with all items + joined medicine data.
   */
  async getCartWithItems(userId) {
    const cart = await this.getOrCreateCart(userId);

    const { rows: items } = await query(
      `SELECT
         ci.id,
         ci.cart_id,
         ci.medicine_id,
         ci.quantity,
         ci.created_at,
         ci.updated_at,
         m.name             AS medicine_name,
         m.generic_name     AS medicine_generic_name,
         m.category         AS medicine_category,
         m.manufacturer     AS medicine_manufacturer,
         m.price            AS medicine_price,
         m.stock            AS medicine_stock,
         m.image_url        AS medicine_image_url,
         m.requires_prescription AS medicine_requires_prescription
       FROM cart_items ci
       JOIN medicines m ON m.id = ci.medicine_id
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at ASC`,
      [cart.id]
    );

    return { cart, items };
  },

  /**
   * Find a specific cart item.
   */
  async findCartItem(cartId, medicineId) {
    const { rows } = await query(
      'SELECT * FROM cart_items WHERE cart_id = $1 AND medicine_id = $2',
      [cartId, medicineId]
    );
    return rows[0] || null;
  },

  /**
   * Add item to cart (or update quantity if already exists).
   */
  async upsertCartItem(cartId, medicineId, quantity) {
    const { rows } = await query(
      `INSERT INTO cart_items (cart_id, medicine_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, medicine_id)
       DO UPDATE SET quantity = $3
       RETURNING *`,
      [cartId, medicineId, quantity]
    );
    return rows[0];
  },

  /**
   * Update quantity of a specific cart item.
   */
  async updateItemQuantity(cartItemId, quantity) {
    const { rows } = await query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
      [quantity, cartItemId]
    );
    return rows[0] || null;
  },

  /**
   * Remove a single item from cart.
   */
  async removeItem(cartItemId) {
    const { rows } = await query(
      'DELETE FROM cart_items WHERE id = $1 RETURNING id',
      [cartItemId]
    );
    return rows[0] || null;
  },

  /**
   * Remove item by cart_id + medicine_id.
   */
  async removeItemByMedicine(cartId, medicineId) {
    const { rows } = await query(
      'DELETE FROM cart_items WHERE cart_id = $1 AND medicine_id = $2 RETURNING id',
      [cartId, medicineId]
    );
    return rows[0] || null;
  },

  /**
   * Clear all items from a cart.
   */
  async clearCart(cartId) {
    await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
  },

  /**
   * Get all items IDs for a given cart (used for checkout).
   */
  async getCartItems(cartId) {
    const { rows } = await query(
      `SELECT ci.*, m.price, m.stock, m.name, m.requires_prescription
       FROM cart_items ci
       JOIN medicines m ON m.id = ci.medicine_id
       WHERE ci.cart_id = $1`,
      [cartId]
    );
    return rows;
  },
};

module.exports = cartRepository;
