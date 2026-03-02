/**
 * Prescription Service — business logic for prescription upload & review.
 */
const prescriptionRepository = require('../repositories/prescription.repository');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');

const prescriptionService = {
  /**
   * Customer uploads a new prescription.
   */
  async upload(userId, file, notes) {
    if (!file) throw new BadRequestError('Prescription file is required');

    // Store a relative path that can be served statically
    const imageUrl = `/uploads/prescriptions/${file.filename}`;
    return prescriptionRepository.create({ userId, imageUrl, notes });
  },

  /**
   * Customer fetches their own prescriptions.
   */
  async getMyPrescriptions(userId) {
    return prescriptionRepository.findByUserId(userId);
  },

  /**
   * Pharmacist / Admin fetches all prescriptions, optionally filtered by status.
   */
  async getAll(status) {
    return prescriptionRepository.findAll(status || null);
  },

  /**
   * Get a single prescription (with ownership check for customers).
   */
  async getById(prescriptionId, requestingUserId, requestingRole) {
    const rx = await prescriptionRepository.findById(prescriptionId);
    if (!rx) throw new NotFoundError('Prescription not found');

    // Customers can only see their own
    if (requestingRole === 'customer' && rx.user_id !== requestingUserId) {
      throw new ForbiddenError('You can only view your own prescriptions');
    }
    return rx;
  },

  /**
   * Pharmacist / Admin reviews (approve / reject) a prescription.
   */
  async review(prescriptionId, reviewerId, { status, notes }) {
    if (!['approved', 'rejected'].includes(status)) {
      throw new BadRequestError('Status must be "approved" or "rejected"');
    }
    const rx = await prescriptionRepository.findById(prescriptionId);
    if (!rx) throw new NotFoundError('Prescription not found');

    if (rx.status !== 'pending') {
      throw new BadRequestError(`Cannot review a prescription that is already "${rx.status}"`);
    }

    return prescriptionRepository.updateStatus(prescriptionId, {
      status,
      notes: notes || null,
      reviewedBy: reviewerId,
    });
  },

  /**
   * Get approved prescriptions for a customer (used during checkout).
   */
  async getApproved(userId) {
    return prescriptionRepository.findApprovedByUserId(userId);
  },
};

module.exports = prescriptionService;
