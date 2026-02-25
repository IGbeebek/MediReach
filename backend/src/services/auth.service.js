const bcrypt = require('bcrypt');
const crypto = require('crypto');
const config = require('../config');
const userRepository = require('../repositories/user.repository');
const tokenRepository = require('../repositories/token.repository');
const resetTokenRepository = require('../repositories/resetToken.repository');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken,
  verifyResetToken,
  parseDuration,
} = require('../utils/jwt');
const { sendPasswordResetEmail } = require('../utils/email');
const {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} = require('../utils/errors');

const SALT_ROUNDS = 12;

/**
 * Auth Service — all business logic for authentication & authorization.
 */

const authService = {
  // ──────────────────────────────────────────────────────────────── REGISTER
  async register({ name, email, password, role, phone, address }) {
    // Check uniqueness
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
    });

    return user;
  },

  // ──────────────────────────────────────────────────────────────── LOGIN
  async login({ email, password, ipAddress, userAgent }) {
    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check blocked
    if (user.status === 'blocked') {
      throw new ForbiddenError('Your account has been blocked. Contact support.');
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshTokenJwt = generateRefreshToken({ userId: user.id });

    // Persist refresh token
    const expiresAt = new Date(
      Date.now() + parseDuration(config.jwt.refreshExpiresIn)
    );
    await tokenRepository.create({
      userId: user.id,
      token: refreshTokenJwt,
      expiresAt,
      ipAddress,
      userAgent,
    });

    // Strip password from response
    const { password: _, ...safeUser } = user;

    return { user: safeUser, accessToken, refreshToken: refreshTokenJwt };
  },

  // ──────────────────────────────────────────────────────────── REFRESH TOKEN
  async refreshToken({ refreshToken, ipAddress, userAgent }) {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    // Verify JWT signature & expiry
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Look up stored token
    const storedToken = await tokenRepository.findByToken(refreshToken);
    if (!storedToken) {
      throw new UnauthorizedError('Refresh token not found');
    }

    // If token has already been revoked → potential reuse attack
    // Revoke the entire family for safety
    if (storedToken.revoked) {
      await tokenRepository.revokeAllForUser(storedToken.user_id);
      throw new UnauthorizedError('Refresh token reuse detected — all sessions revoked');
    }

    // Check expiry in DB as well
    if (new Date(storedToken.expires_at) < new Date()) {
      throw new UnauthorizedError('Refresh token expired');
    }

    // Get user
    const user = await userRepository.findById(decoded.userId);
    if (!user || user.status === 'blocked') {
      await tokenRepository.revokeAllForUser(storedToken.user_id);
      throw new ForbiddenError('Account unavailable');
    }

    // ── Token rotation: issue new pair, revoke old ──
    const newAccessToken = generateAccessToken({ userId: user.id, role: user.role });
    const newRefreshTokenJwt = generateRefreshToken({ userId: user.id });

    const expiresAt = new Date(
      Date.now() + parseDuration(config.jwt.refreshExpiresIn)
    );
    const newRow = await tokenRepository.create({
      userId: user.id,
      token: newRefreshTokenJwt,
      expiresAt,
      ipAddress,
      userAgent,
    });

    // Revoke old token and link to new one
    await tokenRepository.revoke(storedToken.id, newRow.id);

    return { accessToken: newAccessToken, refreshToken: newRefreshTokenJwt };
  },

  // ──────────────────────────────────────────────────────────────── LOGOUT
  async logout(refreshToken) {
    if (!refreshToken) return;

    const storedToken = await tokenRepository.findByToken(refreshToken);
    if (storedToken && !storedToken.revoked) {
      await tokenRepository.revoke(storedToken.id);
    }
  },

  // ────────────────────────────────────────────────────── LOGOUT ALL DEVICES
  async logoutAll(userId) {
    await tokenRepository.revokeAllForUser(userId);
  },

  // ─────────────────────────────────────────────────────── CHANGE PASSWORD
  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw new NotFoundError('User not found');

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) throw new BadRequestError('Current password is incorrect');

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updatePassword(userId, hashed);

    // Revoke all refresh tokens so user must re-login
    await tokenRepository.revokeAllForUser(userId);
  },

  // ─────────────────────────────────────────────────── FORGOT PASSWORD
  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);

    // Always respond with success to prevent email enumeration
    if (!user) return;

    // Generate a short-lived reset JWT
    const resetJwt = generateResetToken({ userId: user.id });

    const expiresAt = new Date(
      Date.now() + parseDuration(config.passwordReset.expiresIn)
    );

    await resetTokenRepository.create({
      userId: user.id,
      token: resetJwt,
      expiresAt,
    });

    const resetUrl = `${config.clientUrl}/reset-password?token=${resetJwt}`;

    await sendPasswordResetEmail(user.email, resetUrl);
  },

  // ─────────────────────────────────────────────────── RESET PASSWORD
  async resetPassword({ token, newPassword }) {
    // Verify JWT
    let decoded;
    try {
      decoded = verifyResetToken(token);
    } catch {
      throw new BadRequestError('Invalid or expired reset token');
    }

    // Check DB record
    const record = await resetTokenRepository.findValidToken(token);
    if (!record) {
      throw new BadRequestError('Reset token is invalid or has already been used');
    }

    // Hash & update
    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updatePassword(decoded.userId, hashed);

    // Mark token as used
    await resetTokenRepository.markUsed(record.id);

    // Revoke all refresh tokens so user must re-login
    await tokenRepository.revokeAllForUser(decoded.userId);
  },

  // ─────────────────────────────────────────────────── GET PROFILE
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  },
};

module.exports = authService;
