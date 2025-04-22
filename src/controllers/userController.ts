import { Request, Response } from "express";
import { db } from "../db/database";
import { ApiError } from "../utils/errors";

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

    // Query the database for the user
    const user = await db.query(
      `
      SELECT
        id,
        username,
        email,
        first_name,
        last_name,
        avatar_url,
        created_at,
        updated_at,
        last_login_at,
        status
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    // Check if user exists
    if (user.rows.length === 0) {
      throw new ApiError(404, "User not found");
    }

    // Return the user data
    return res.status(200).json({
      status: "success",
      data: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        email: user.rows[0].email,
        firstName: user.rows[0].first_name,
        lastName: user.rows[0].last_name,
        avatarUrl: user.rows[0].avatar_url,
        createdAt: user.rows[0].created_at,
        updatedAt: user.rows[0].updated_at,
        lastLoginAt: user.rows[0].last_login_at,
        status: user.rows[0].status,
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
    // Query the database for all users
    const users = await db.query(
      `
      SELECT
        id,
        username,
        email,
        first_name,
        last_name,
        avatar_url,
        created_at,
        updated_at,
        last_login_at,
        status
      FROM users
      ORDER BY created_at DESC
      `
    );

    // Transform the data to match the frontend expectations
    const transformedUsers = users.rows.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLoginAt: user.last_login_at,
      status: user.status,
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

    // Update the user's status
    const updatedUser = await db.query(
      `
      UPDATE users
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, username, email, first_name, last_name, avatar_url, status
      `,
      [status, userId]
    );

    // Check if user exists
    if (updatedUser.rows.length === 0) {
      throw new ApiError(404, "User not found");
    }

    // Return the updated user data
    return res.status(200).json({
      status: "success",
      data: {
        id: updatedUser.rows[0].id,
        username: updatedUser.rows[0].username,
        email: updatedUser.rows[0].email,
        firstName: updatedUser.rows[0].first_name,
        lastName: updatedUser.rows[0].last_name,
        avatarUrl: updatedUser.rows[0].avatar_url,
        status: updatedUser.rows[0].status,
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
