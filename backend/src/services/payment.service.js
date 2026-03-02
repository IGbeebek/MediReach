/**
 * Payment Service — business logic for COD and eSewa payments.
 *
 * eSewa flow:
 *   1. Frontend calls POST /api/payments/esewa/initiate  → gets form data
 *   2. Frontend submits form to eSewa
 *   3. eSewa redirects to success/failure URL with encoded `data` param
 *   4. Frontend calls POST /api/payments/esewa/verify with the data param
 *
 * COD flow:
 *   1. Checkout sets paymentMethod = 'cod' and paymentStatus = 'pending'
 *   2. On delivery, admin marks order delivered → payment status becomes 'paid'
 */

const crypto = require('crypto');
const config = require('../config');
const paymentRepository = require('../repositories/payment.repository');
const orderRepository = require('../repositories/order.repository');
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
} = require('../utils/errors');

/* ================================================================
   HELPER: generate idempotency key for a payment attempt
   ================================================================ */
function makeIdempotencyKey(orderId, method) {
  return `${orderId}:${method}:${Date.now()}`;
}

/* ================================================================
   eSewa helpers
   ================================================================ */

/**
 * Generate HMAC-SHA256 signature for eSewa.
 * Signing string: `total_amount=${amount},transaction_uuid=${txnId},product_code=${code}`
 */
function esewaSignature(totalAmount, transactionUuid, productCode) {
  const signString = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  return crypto
    .createHmac('sha256', config.esewa.secret)
    .update(signString)
    .digest('base64');
}

/**
 * Verify the base64-encoded data returned by eSewa after payment.
 * eSewa sends a JSON payload encoded in base64 to the success URL.
 */
function decodeEsewaResponse(encodedData) {
  const json = Buffer.from(encodedData, 'base64').toString('utf-8');
  return JSON.parse(json);
}

/* ================================================================
   Payment Service
   ================================================================ */
const paymentService = {
  /* ──────────────────────────────────────────────── COD ─────────── */

  /**
   * For COD, we simply create a pending payment record.
   * Called automatically during checkout if paymentMethod === 'cod'.
   */
  async createCodPayment(orderId, amount) {
    const existing = await paymentRepository.findByOrderId(orderId);
    const alreadyPaid = existing.find((p) => p.status === 'success');
    if (alreadyPaid) throw new ConflictError('Order already paid');

    return paymentRepository.create({
      orderId,
      method: 'cod',
      amount,
      status: 'pending',
      idempotencyKey: makeIdempotencyKey(orderId, 'cod'),
    });
  },

  /**
   * Mark COD payment as paid (called when order is delivered).
   */
  async markCodPaid(orderId) {
    const payments = await paymentRepository.findByOrderId(orderId);
    const codPayment = payments.find((p) => p.method === 'cod' && p.status === 'pending');
    if (!codPayment) throw new NotFoundError('No pending COD payment found');

    await paymentRepository.updateStatus(codPayment.id, {
      status: 'success',
      transactionId: `COD-${orderId.slice(0, 8)}`,
    });

    await orderRepository.updatePaymentStatus(orderId, 'paid');
    return { message: 'COD payment marked as paid' };
  },

  /* ──────────────────────────────────────────────── eSewa ──────── */

  /**
   * Build the form data the frontend needs to POST to eSewa.
   */
  async initiateEsewa(orderId, userId) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (order.user_id !== userId) throw new BadRequestError('Access denied');
    if (order.payment_method !== 'esewa') {
      throw new BadRequestError('Order payment method is not eSewa');
    }
    if (order.payment_status === 'paid') {
      throw new ConflictError('Order is already paid');
    }

    const transactionUuid = `ESW-${order.id.slice(0, 8)}-${Date.now()}`;
    const amount = parseFloat(order.grand_total);
    const taxAmount = 0; // tax already included in grand_total
    const productServiceCharge = 0;
    const productDeliveryCharge = 0;
    const totalAmount = amount;
    const productCode = config.esewa.merchantCode;
    const signature = esewaSignature(totalAmount, transactionUuid, productCode);

    // Create pending payment record
    const idempotencyKey = makeIdempotencyKey(orderId, 'esewa');
    await paymentRepository.create({
      orderId,
      method: 'esewa',
      amount: totalAmount,
      status: 'pending',
      transactionId: transactionUuid,
      idempotencyKey,
    });

    // Return data for frontend to submit as an HTML form to eSewa
    return {
      paymentUrl: config.esewa.paymentUrl,
      formData: {
        amount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: productCode,
        product_service_charge: productServiceCharge,
        product_delivery_charge: productDeliveryCharge,
        success_url: `${config.clientUrl}/customer/payment/esewa/success`,
        failure_url: `${config.clientUrl}/customer/payment/esewa/failure`,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature,
      },
    };
  },

  /**
   * Verify eSewa payment callback.
   * The frontend receives a `data` query param (base64 encoded JSON) from eSewa
   * and POSTs it here.
   */
  async verifyEsewa(encodedData) {
    let decoded;
    try {
      decoded = decodeEsewaResponse(encodedData);
    } catch {
      throw new BadRequestError('Invalid eSewa response data');
    }

    const {
      transaction_uuid,
      product_code,
      total_amount,
      status,
      signed_field_names,
      signature: receivedSig,
    } = decoded;

    // Verify signature
    const expectedSig = esewaSignature(total_amount, transaction_uuid, product_code);
    if (expectedSig !== receivedSig) {
      throw new BadRequestError('eSewa signature verification failed');
    }

    // Find the payment record
    const payment = await paymentRepository.findByTransactionId(transaction_uuid);
    if (!payment) throw new NotFoundError('Payment record not found');

    // Idempotency: already processed?
    if (payment.status === 'success') {
      return { message: 'Payment already verified', orderId: payment.order_id };
    }

    if (status === 'COMPLETE') {
      await paymentRepository.updateStatus(payment.id, {
        status: 'success',
        providerRef: transaction_uuid,
        providerResponse: decoded,
      });
      await orderRepository.updatePaymentStatus(payment.order_id, 'paid');

      // If order was pending, move to verified
      const order = await orderRepository.findById(payment.order_id);
      if (order && order.status === 'pending') {
        await orderRepository.updateStatus(payment.order_id, 'verified');
      }

      return { message: 'Payment verified successfully', orderId: payment.order_id };
    }

    // Payment failed
    await paymentRepository.updateStatus(payment.id, {
      status: 'failed',
      providerResponse: decoded,
    });
    await orderRepository.updatePaymentStatus(payment.order_id, 'failed');

    throw new BadRequestError('eSewa payment was not completed');
  },

  /* ──────────────────────────────────────────── Shared ──────────── */

  /**
   * Get payment records for an order.
   */
  async getOrderPayments(orderId) {
    const payments = await paymentRepository.findByOrderId(orderId);
    return payments.map((p) => ({
      id: p.id,
      orderId: p.order_id,
      method: p.method,
      amount: parseFloat(p.amount),
      status: p.status,
      transactionId: p.transaction_id,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
  },
};

module.exports = paymentService;
