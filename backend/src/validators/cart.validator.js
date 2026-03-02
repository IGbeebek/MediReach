/**
 * Cart & Order Validators — Zod schemas
 */

const { z } = require('zod');

const addToCartSchema = z.object({
  medicineId: z
    .string({ required_error: 'medicineId is required' })
    .uuid('medicineId must be a valid UUID'),
  quantity: z
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Quantity cannot exceed 100')
    .optional()
    .default(1),
});

const updateCartItemSchema = z.object({
  quantity: z
    .number({ required_error: 'quantity is required' })
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Quantity cannot exceed 100'),
});

const checkoutSchema = z.object({
  paymentMethod: z.enum(['cod', 'esewa'], {
    required_error: 'paymentMethod is required',
    invalid_type_error: 'paymentMethod must be cod or esewa',
  }),
  shippingAddress: z
    .string({ required_error: 'shippingAddress is required' })
    .trim()
    .min(5, 'Shipping address must be at least 5 characters')
    .max(500),
  shippingPhone: z
    .string({ required_error: 'shippingPhone is required' })
    .trim()
    .min(7, 'Phone must be at least 7 digits')
    .max(20),
  notes: z.string().max(500).optional(),
  prescriptionId: z.string().uuid('prescriptionId must be a valid UUID').optional(),
});

const initiatePaymentSchema = z.object({
  orderId: z
    .string({ required_error: 'orderId is required' })
    .uuid('orderId must be a valid UUID'),
});

const verifyEsewaSchema = z.object({
  data: z.string({ required_error: 'Encoded data is required' }).min(1),
});

module.exports = {
  addToCartSchema,
  updateCartItemSchema,
  checkoutSchema,
  initiatePaymentSchema,
  verifyEsewaSchema,
};
