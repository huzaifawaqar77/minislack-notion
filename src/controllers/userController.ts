import { Request, Response } from "express";
import { db } from "../db/database";
import { ApiError } from "../utils/errors";
import { getUserById as getUserByIdRepo } from "../repositories/userRepository";

/**
 * Get a user by ID
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }

    // Use the repository function to get the user
    const user = await getUserByIdRepo(userId);

    // Check if user exists
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Return the user data
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
        status: "online", // Default status since it's not in the repository function
      },
    });
  } catch (error) {
    console.error("Error getting user:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        status: "error",
        message: error.message,
      });
    }
    return res.status(500).json({
      status: "error",
      message: "Failed to get user",
    });
  }
};

/**
 * Get all users
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Query the database for all users using Kysely
    const users = await db
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
      ])
      .orderBy("created_at", "desc")
      .execute();

    // Transform the data to match the frontend expectations
    const transformedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLoginAt: user.last_active,
      status: user.status || "online",
    }));

    // Return the users data
    return res.status(200).json({
      status: "success",
      data: transformedUsers,
    });
  } catch (error) {
    console.error("Error getting users:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get users",
    });
  }
};

/**
 * Update a user's status (online/offline)
 */
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    // Validate userId
    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }

    // Validate status
    if (!status || !["online", "offline", "away", "busy"].includes(status)) {
      throw new ApiError(
        400,
        "Valid status is required (online, offline, away, busy)"
      );
    }

    // Update the user's status using Kysely
    const updatedUser = await db
      .updateTable("users")
      .set({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .where("id", "=", userId)
      .returning([
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "avatar_url",
        "status",
      ])
      .executeTakeFirst();

    // Check if user exists
    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    // Return the updated user data
    return res.status(200).json({
      status: "success",
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        avatarUrl: updatedUser.avatar_url,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        status: "error",
        message: error.message,
      });
    }
    return res.status(500).json({
      status: "error",
      message: "Failed to update user status",
    });
  }
};
