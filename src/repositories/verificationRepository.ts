import { db } from "../db/database";
import crypto from "crypto";

/**
 * Generates a verification token for a user
 *
 * @param userId - The ID of the user
 * @returns The generated verification token
 */
export async function generateVerificationToken(
  userId: string
): Promise<string> {
  // Generate a random token
  const token = crypto.randomBytes(32).toString("hex");

  // Calculate expiry date (24 hours from now)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // Store the token in the database
  await db
    .insertInto("verification_tokens")
    .values({
      id: crypto.randomUUID(),
      user_id: userId,
      token: token,
      type: "email_verification",
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      is_used: false,
    })
    .execute();

  return token;
}

/**
 * Verifies a token and marks it as used if valid
 *
 * @param token - The token to verify
 * @returns The user ID associated with the token if valid, null otherwise
 */
export async function verifyToken(token: string): Promise<string | null> {
  // Find the token in the database
  const verificationToken = await db
    .selectFrom("verification_tokens")
    .selectAll()
    .where("token", "=", token)
    .where("is_used", "=", false)
    .where("expires_at", ">", new Date().toISOString())
    .where("type", "=", "email_verification")
    .executeTakeFirst();

  if (!verificationToken) {
    return null;
  }

  // Mark the token as used
  await db
    .updateTable("verification_tokens")
    .set({
      is_used: true,
      used_at: new Date().toISOString(),
    })
    .where("id", "=", verificationToken.id)
    .execute();

  return verificationToken.user_id;
}

/**
 * Marks a user's email as verified
 *
 * @param userId - The ID of the user
 * @returns True if successful, false otherwise
 */
export async function markEmailAsVerified(userId: string): Promise<boolean> {
  try {
    await db
      .updateTable("users")
      .set({
        email_verified: true,
        updated_at: new Date().toISOString(),
      })
      .where("id", "=", userId)
      .execute();

    return true;
  } catch (error: any) {
    console.error("Error marking email as verified:", error);
    return false;
  }
}
