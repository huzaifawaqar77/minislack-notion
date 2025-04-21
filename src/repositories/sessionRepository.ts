import { db } from "../db/database";
import crypto from "crypto";
import { UserSessions } from "../types/databaseTypes";

/**
 * Creates a new user session in the database
 *
 * @param userId - The ID of the user
 * @param token - The JWT token
 * @param deviceInfo - Information about the user's device
 * @param ipAddress - The user's IP address
 * @param location - The user's location (optional)
 * @returns The created session
 */
export async function createUserSession(
  userId: string,
  token: string,
  deviceInfo: any,
  ipAddress: string,
  location?: string
) {
  // Calculate expiry date (7 days from now to match JWT expiry)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const session = await db
    .insertInto("user_sessions")
    .values({
      id: crypto.randomUUID(),
      user_id: userId,
      token: token,
      device_info: deviceInfo,
      ip_address: ipAddress,
      location: location || null,
      is_active: true,
      last_active: new Date().toISOString(),
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return session;
}

/**
 * Gets all active sessions for a user
 *
 * @param userId - The ID of the user
 * @returns Array of active user sessions
 */
export async function getUserSessions(userId: string) {
  const sessions = await db
    .selectFrom("user_sessions")
    .selectAll()
    .where("user_id", "=", userId)
    .where("is_active", "=", true)
    .where("expires_at", ">", new Date())
    .execute();

  return sessions;
}

/**
 * Deactivates a specific session
 *
 * @param sessionId - The ID of the session to deactivate
 */
export async function deactivateSession(sessionId: string) {
  await db
    .updateTable("user_sessions")
    .set({
      is_active: false,
      last_active: new Date().toISOString(),
    })
    .where("id", "=", sessionId)
    .execute();
}

/**
 * Deactivates all sessions for a user
 *
 * @param userId - The ID of the user
 */
export async function deactivateAllUserSessions(userId: string) {
  await db
    .updateTable("user_sessions")
    .set({
      is_active: false,
      last_active: new Date().toISOString(),
    })
    .where("user_id", "=", userId)
    .execute();
}
