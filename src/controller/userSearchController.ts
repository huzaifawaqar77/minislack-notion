import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { db } from "../db/database";
import { sql } from "kysely";

/**
 * Search for users by name or username
 */
export async function searchUsersController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { query } = req.query;
    const workspaceId = req.query.workspaceId as string;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    if (!query) {
      return res.status(400).json({
        status: "error",
        message: "Search query is required",
      });
    }

    let users;

    if (workspaceId) {
      // Search for users in a specific workspace
      users = await db
        .selectFrom("users as u")
        .innerJoin("workspace_members as wm", "u.id", "wm.user_id")
        .select([
          "u.id",
          "u.username",
          "u.first_name",
          "u.last_name",
          "u.avatar_url",
          "u.email",
        ])
        .where("wm.workspace_id", "=", workspaceId)
        .where((eb) =>
          eb.or([
            eb("u.username", "ilike", `%${query}%`),
            eb("u.first_name", "ilike", `%${query}%`),
            eb("u.last_name", "ilike", `%${query}%`),
            eb("u.email", "ilike", `%${query}%`),
            eb(
              sql`concat(u.first_name, ' ', u.last_name)`,
              "ilike",
              `%${query}%`
            ),
          ])
        )
        .where("u.id", "!=", req.user.id) // Exclude the current user
        .limit(limit)
        .execute();
    } else {
      // Search for all users
      users = await db
        .selectFrom("users as u")
        .select([
          "u.id",
          "u.username",
          "u.first_name",
          "u.last_name",
          "u.avatar_url",
          "u.email",
        ])
        .where((eb) =>
          eb.or([
            eb("u.username", "ilike", `%${query}%`),
            eb("u.first_name", "ilike", `%${query}%`),
            eb("u.last_name", "ilike", `%${query}%`),
            eb("u.email", "ilike", `%${query}%`),
            eb(
              sql`concat(u.first_name, ' ', u.last_name)`,
              "ilike",
              `%${query}%`
            ),
          ])
        )
        .where("u.id", "!=", req.user.id) // Exclude the current user
        .limit(limit)
        .execute();
    }

    return res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error: any) {
    console.error("Error searching users:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to search users",
    });
  }
}
