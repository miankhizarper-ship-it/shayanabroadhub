import bcrypt from "bcryptjs";

/**
 * Password hashing — bcrypt (via bcryptjs).
 *
 * bcryptjs implements the bcrypt algorithm in pure JavaScript,
 * which is what makes it reliable inside Vercel's serverless
 * runtime (no native compilation step).
 */

const ROUNDS = 12;

/** @param {string} plainText */
export async function hashPassword(plainText) {
  return bcrypt.hash(plainText, ROUNDS);
}

/** @param {string} plainText @param {string} passwordHash */
export async function verifyPassword(plainText, passwordHash) {
  return bcrypt.compare(plainText, passwordHash);
}
