/**
 * Cart Service — business logic for the shopping cart.
 */

const cartRepository = require('../repositories/cart.repository');
const medicineRepository = require('../repositories/medicine.repository');
const { BadRequestError, NotFoundError } = require('../utils/errors');

/** Delivery fee thresholds (in NPR) */
const FREE_DELIVERY_THRESHOLD = 1000;
const DELIVERY_FEE = 100;
const TAX_RATE = 0.13; // 13% VAT (Nepal)

/**
 * Format a DB cart item row → frontend-friendly object.
 */
function formatCartItem(row) {
  return {
    id: row.id,
    cartId: row.cart_id,
    medicineId: row.medicine_id,
    quantity: row.quantity,
    medicineName: row.medicine_name,
    genericName: row.medicine_generic_name,
    category: row.medicine_category,
    manufacturer: row.medicine_manufacturer,
    price: parseFloat(row.medicine_price),
    stock: row.medicine_stock,
    imageUrl: row.medicine_image_url,
    requiresPrescription: row.medicine_requires_prescription,
    lineTotal: row.quantity * parseFloat(row.medicine_price),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Calculate totals from an array of formatted cart items.
 */
function calculateTotals(items) {
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const grandTotal = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax,
    deliveryFee,
    grandTotal,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
  };
}

const cartService = {
  /**
   * Get the full cart for a user, formatted with calculated totals.
   */
  async getCart(userId) {
    const { cart, items } = await cartRepository.getCartWithItems(userId);
    const formattedItems = items.map(formatCartItem);
    const totals = calculateTotals(formattedItems);
    const requiresPrescription = formattedItems.some((i) => i.requiresPrescription);

    return {
      cartId: cart.id,
      items: formattedItems,
      itemCount: formattedItems.length,
      totalQuantity: formattedItems.reduce((s, i) => s + i.quantity, 0),
      requiresPrescription,
      ...totals,
    };
  },

  /**
   * Add a medicine to the cart (or update qty if already present).
   * Validates stock availability.
   */
  async addItem(userId, medicineId, quantity = 1) {
    if (quantity < 1) throw new BadRequestError('Quantity must be at least 1');

    // Validate medicine exists
    const medicine = await medicineRepository.findById(medicineId);
    if (!medicine) throw new NotFoundError('Medicine not found');

    // Validate stock
    if (medicine.stock < quantity) {
      throw new BadRequestError(
        `Insufficient stock. Only ${medicine.stock} unit(s) available for "${medicine.name}"`
      );
    }

    const cart = await cartRepository.getOrCreateCart(userId);

    // Check if already in cart — if so, the new qty replaces
    const existing = await cartRepository.findCartItem(cart.id, medicineId);
    const newQty = existing ? existing.quantity + quantity : quantity;

    if (medicine.stock < newQty) {
      throw new BadRequestError(
        `Cannot add ${quantity} more. You already have ${existing?.quantity || 0} in cart and only ${medicine.stock} available.`
      );
    }

    await cartRepository.upsertCartItem(cart.id, medicineId, newQty);
    return this.getCart(userId);
  },

  /**
   * Update quantity for an existing cart item.
   */
  async updateItemQuantity(userId, medicineId, quantity) {
    if (quantity < 1) throw new BadRequestError('Quantity must be at least 1');

    const cart = await cartRepository.getOrCreateCart(userId);
    const item = await cartRepository.findCartItem(cart.id, medicineId);
    if (!item) throw new NotFoundError('Item not in cart');

    // Validate stock
    const medicine = await medicineRepository.findById(medicineId);
    if (!medicine) throw new NotFoundError('Medicine no longer exists');

    if (medicine.stock < quantity) {
      throw new BadRequestError(
        `Insufficient stock. Only ${medicine.stock} unit(s) available for "${medicine.name}"`
      );
    }

    await cartRepository.upsertCartItem(cart.id, medicineId, quantity);
    return this.getCart(userId);
  },

  /**
   * Remove a single medicine from the cart.
   */
  async removeItem(userId, medicineId) {
    const cart = await cartRepository.getOrCreateCart(userId);
    const removed = await cartRepository.removeItemByMedicine(cart.id, medicineId);
    if (!removed) throw new NotFoundError('Item not in cart');
    return this.getCart(userId);
  },

  /**
   * Clear all items from the cart.
   */
  async clearCart(userId) {
    const cart = await cartRepository.getOrCreateCart(userId);
    await cartRepository.clearCart(cart.id);
    return this.getCart(userId);
  },
};

module.exports = cartService;
module.exports.calculateTotals = calculateTotals;
module.exports.TAX_RATE = TAX_RATE;
module.exports.DELIVERY_FEE = DELIVERY_FEE;
module.exports.FREE_DELIVERY_THRESHOLD = FREE_DELIVERY_THRESHOLD;
