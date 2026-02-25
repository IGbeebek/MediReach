const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate a short-lived access token.
 * Payload: { userId, role }
 */
const generateAccessToken = (payload) =>
  jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });

/**
 * Generate a long-lived refresh token.
 * Payload: { userId, tokenId }   — tokenId maps to DB row for revocation
 */
const generateRefreshToken = (payload) =>
  jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

/**
 * Verify an access token.  Returns decoded payload or throws.
 */
const verifyAccessToken = (token) =>
  jwt.verify(token, config.jwt.accessSecret);

/**
 * Verify a refresh token.  Returns decoded payload or throws.
 */
const verifyRefreshToken = (token) =>
  jwt.verify(token, config.jwt.refreshSecret);

/**
 * Generate a password-reset token (short-lived, separate secret).
 */
const generateResetToken = (payload) =>
  jwt.sign(payload, config.passwordReset.secret, {
    expiresIn: config.passwordReset.expiresIn,
  });

/**
 * Verify a password-reset token.
 */
const verifyResetToken = (token) =>
  jwt.verify(token, config.passwordReset.secret);

/**
 * Parse a human-readable duration (e.g. "7d", "15m", "1h") into milliseconds.
 */
const parseDuration = (str) => {
  const match = str.match(/^(\d+)\s*(s|m|h|d)$/i);
  if (!match) return 0;
  const num = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return num * (multipliers[unit] || 0);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateResetToken,
  verifyResetToken,
  parseDuration,
};
