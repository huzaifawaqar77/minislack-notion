import { db } from "../db/database";
import crypto from "crypto";

/**
 * Creates a new CSRF token for a user
 * 
 * @param userId - The ID of the user
 * @returns The created CSRF token
 */
export async function createCsrfToken(userId: string): Promise<string> {
  // Generate a random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Calculate expiry date (24 hours from now)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  
  // Store the token in the database
  await db
    .insertInto("csrf_tokens")
    .values({
      id: crypto.randomUUID(),
      token,
      user_id: userId,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    })
    .execute();
  
  return token;
}

/**
 * Validates a CSRF token
 * 
 * @param token - The token to validate
 * @param userId - The ID of the user
 * @returns True if the token is valid
 */
export async function validateCsrfToken(token: string, userId: string): Promise<boolean> {
  // Find the token in the database
  const csrfToken = await db
    .selectFrom("csrf_tokens")
    .select(["id", "expires_at"])
    .where("token", "=", token)
    .where("user_id", "=", userId)
    .where("expires_at", ">", new Date().toISOString())
    .executeTakeFirst();
  
  return !!csrfToken;
}

/**
 * Invalidates a CSRF token
 * 
 * @param token - The token to invalidate
 */
export async function invalidateCsrfToken(token: string): Promise<void> {
  await db
    .deleteFrom("csrf_tokens")
    .where("token", "=", token)
    .execute();
}

/**
 * Cleans up expired CSRF tokens
 */
export async function cleanupExpiredCsrfTokens(): Promise<void> {
  await db
    .deleteFrom("csrf_tokens")
    .where("expires_at", "<=", new Date().toISOString())
    .execute();
}
