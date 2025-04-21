import { db } from "../db/database";
import { Users } from "../types/databaseTypes";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/environment";
import { createUserSession } from "./sessionRepository";
import { generateVerificationToken } from "./verificationRepository";
import {
  sendVerificationEmail,
  OrganizationBranding,
} from "../services/emailService";

export async function registerUser(
  email: string,
  username: string,
  password: string,
  firstName: string,
  lastName: string,
  sendVerificationEmailFlag: boolean = true,
  organizationId?: string,
  branding?: OrganizationBranding
) {
  console.log(
    email,
    username,
    password,
    firstName,
    lastName,
    "registration of new user"
  );

  const existingUser = await db
    .selectFrom("users")
    .select(["id"])
    .where("email", "=", email)
    .executeTakeFirst();

  console.log("existing user", existingUser);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  console.log("hashed password", hashedPassword);

  const userId = crypto.randomUUID();

  const newUser = await db
    .insertInto("users")
    .values({
      id: userId,
      email,
      username,
      password_hash: hashedPassword,
      first_name: firstName ?? null,
      last_name: lastName ?? null,
      created_at: new Date().toISOString(),
      email_verified: false,
      is_admin: false,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  console.log("new user here", newUser);

  // If organization ID is provided, create a default workspace for the user in that organization
  if (organizationId) {
    try {
      // Create a personal workspace for the user in the organization
      await db
        .insertInto("workspaces")
        .values({
          id: crypto.randomUUID(),
          name: `${firstName}'s Workspace`,
          slug: `${username.toLowerCase()}-workspace`,
          created_by: userId,
          organization_id: organizationId,
          is_public: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .execute();
    } catch (error) {
      console.error("Failed to create workspace for user:", error);
      // Continue with registration even if workspace creation fails
    }
  }

  // Send verification email if flag is true
  if (sendVerificationEmailFlag) {
    try {
      // Generate a verification token
      const verificationToken = await generateVerificationToken(userId);

      // Send verification email with optional branding
      await sendVerificationEmail(
        email,
        firstName || username,
        verificationToken,
        undefined, // verification code
        branding
      );

      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      // Continue with registration even if email sending fails
    }
  }

  return {
    id: newUser.id,
    email: newUser.email,
    username: newUser.username,
    created_at: newUser.created_at,
    email_verified: newUser.email_verified,
  };
}

// Login User

export async function loginUser(
  emailOrUsername: string,
  password: string,
  deviceInfo?: any,
  ipAddress?: string
) {
  const user = await db
    .selectFrom("users")
    .selectAll()
    .where((qb) =>
      qb.or([
        qb("email", "=", emailOrUsername),
        qb("username", "=", emailOrUsername),
      ])
    )
    .executeTakeFirst();

  if (!user) {
    throw new Error("Invalid email/username or password");
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new Error("Invalid email/username or password");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    jwtSecret,
    { expiresIn: "7d" }
  );

  // Create a session if device info is provided
  if (deviceInfo && ipAddress) {
    try {
      await createUserSession(user.id, token, deviceInfo, ipAddress);

      // Update user's last active timestamp
      await db
        .updateTable("users")
        .set({ last_active: new Date().toISOString() })
        .where("id", "=", user.id)
        .execute();
    } catch (error) {
      console.error("Failed to create user session:", error);
      // Continue with login even if session creation fails
    }
  }

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
    },
  };
}
