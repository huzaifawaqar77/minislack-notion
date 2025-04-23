import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { db } from "../db/database";
import { ApiError } from "../utils/errors";

/**
 * Get the current user's profile
 */
export async function getProfileController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const user = await db
      .selectFrom("users")
      .select([
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "avatar_url",
        "created_at",
        "updated_at",
        "last_active",
        "status",
        "email_verified",
      ])
      .where("id", "=", req.user.id)
      .executeTakeFirst();

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLoginAt: user.last_active,
        status: user.status || "offline",
        emailVerified: user.email_verified,
      },
    });
  } catch (error) {
    console.error("Error getting profile:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get profile",
    });
  }
}

/**
 * Update the current user's profile
 */
export async function updateProfileController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const { firstName, lastName, username, email } = req.body;

    // Validate input
    if (username && username.length < 3) {
      throw new ApiError(400, "Username must be at least 3 characters long");
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
      }

      // Check if email is already taken by another user
      const existingUser = await db
        .selectFrom("users")
        .select(["id"])
        .where("email", "=", email)
        .where("id", "!=", req.user.id)
        .executeTakeFirst();

      if (existingUser) {
        throw new ApiError(400, "Email is already taken");
      }
    }

    if (username) {
      // Check if username is already taken by another user
      const existingUser = await db
        .selectFrom("users")
        .select(["id"])
        .where("username", "=", username)
        .where("id", "!=", req.user.id)
        .executeTakeFirst();

      if (existingUser) {
        throw new ApiError(400, "Username is already taken");
      }
    }

    // Update the user
    const updatedUser = await db
      .updateTable("users")
      .set({
        first_name: firstName !== undefined ? firstName : undefined,
        last_name: lastName !== undefined ? lastName : undefined,
        username: username !== undefined ? username : undefined,
        email: email !== undefined ? email : undefined,
        updated_at: new Date().toISOString(),
      })
      .where("id", "=", req.user.id)
      .returning([
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "avatar_url",
        "created_at",
        "updated_at",
        "last_active",
        "status",
        "email_verified",
      ])
      .executeTakeFirst();

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    return res.status(200).json({
      status: "success",
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        avatarUrl: updatedUser.avatar_url,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
        lastLoginAt: updatedUser.last_active,
        status: updatedUser.status || "offline",
        emailVerified: updatedUser.email_verified,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        status: "error",
        message: error.message,
      });
    }
    return res.status(500).json({
      status: "error",
      message: "Failed to update profile",
    });
  }
}

/**
 * Update the current user's avatar
 */
export async function updateAvatarController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    if (!req.file) {
      throw new ApiError(400, "No file uploaded");
    }

    // Process the uploaded file and save it to the uploads directory
    const file = req.file;
    console.log("Avatar upload request received:", {
      userId: req.user.id,
      fileInfo: {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
    });

    const fileExtension = file.originalname.split(".").pop();
    const fileName = `${req.user.id}-${Date.now()}.${fileExtension}`;
    const filePath = `public/uploads/avatars/${fileName}`;
    console.log("Avatar file path:", filePath);

    // Create the directory if it doesn't exist
    const fs = require("fs");
    const path = require("path");
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      console.log("Creating directory:", dir);
      fs.mkdirSync(dir, { recursive: true });
    }

    let avatarUrl;
    try {
      // Write the file to disk
      fs.writeFileSync(filePath, file.buffer);
      console.log("Avatar file saved successfully");

      // Set the avatar URL to be served by the static middleware
      avatarUrl = `/public/uploads/avatars/${fileName}`;
      console.log("Avatar URL:", avatarUrl);
    } catch (error) {
      console.error("Error saving avatar file:", error);
      throw new ApiError(500, "Failed to save avatar file");
    }

    // Update the user's avatar URL
    const updatedUser = await db
      .updateTable("users")
      .set({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .where("id", "=", req.user.id)
      .returning([
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "avatar_url",
        "created_at",
        "updated_at",
      ])
      .executeTakeFirst();

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    return res.status(200).json({
      status: "success",
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        avatarUrl: updatedUser.avatar_url,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
      },
    });
  } catch (error) {
    console.error("Error updating avatar:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        status: "error",
        message: error.message,
      });
    }
    return res.status(500).json({
      status: "error",
      message: "Failed to update avatar",
    });
  }
}
