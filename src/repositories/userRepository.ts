import { db } from "../db/database";
import { Users } from "../types/databaseTypes";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/environment";

export async function registerUser(
  email: string,
  username: string,
  password: string,
  firstName: string,
  lastName: string
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

  const newUser = await db
    .insertInto("users")
    .values({
      id: crypto.randomUUID(),
      email,
      username,
      password_hash: hashedPassword,
      first_name: firstName ?? null,
      last_name: lastName ?? null,
      created_at: new Date().toISOString as any,
      email_verified: false,
      is_admin: false,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  console.log("new user here", newUser);

  return {
    id: newUser.id,
    email: newUser.email,
    username: newUser.username,
    created_at: newUser.created_at,
  };
}

// Login User

export async function loginUser(emailOrUsername: string, password: string) {
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
