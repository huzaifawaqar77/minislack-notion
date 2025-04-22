import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { createCsrfToken, invalidateCsrfToken } from "../repositories/csrfRepository";
import { db } from "../db/database";

/**
 * Generates a new CSRF token for the authenticated user
 */
export async function generateCsrfTokenController(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const token = await createCsrfToken(req.user.id);
    
    return res.status(200).json({
      status: "success",
      data: { token }
    });
  } catch (error) {
    console.error("Error generating CSRF token:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to generate CSRF token"
    });
  }
}

/**
 * Invalidates a CSRF token
 */
export async function invalidateCsrfTokenController(req: AuthenticatedRequest, res: Response) {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "Token is required"
      });
    }
    
    await invalidateCsrfToken(token);
    
    return res.status(200).json({
      status: "success",
      message: "Token invalidated successfully"
    });
  } catch (error) {
    console.error("Error invalidating CSRF token:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to invalidate CSRF token"
    });
  }
}

/**
 * Gets security events for the authenticated user
 */
export async function getSecurityEventsController(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    // Check if user is an admin
    const user = await db
      .selectFrom("users")
      .select(["is_admin"])
      .where("id", "=", req.user.id)
      .executeTakeFirst();
    
    if (!user?.is_admin) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden"
      });
    }
    
    const { limit = 100, offset = 0, eventType } = req.query;
    
    // Build the query
    let query = db
      .selectFrom("security_events")
      .selectAll()
      .orderBy("created_at", "desc")
      .limit(Number(limit))
      .offset(Number(offset));
    
    // Add event type filter if provided
    if (eventType) {
      query = query.where("event_type", "=", eventType as string);
    }
    
    const events = await query.execute();
    
    return res.status(200).json({
      status: "success",
      data: events
    });
  } catch (error) {
    console.error("Error getting security events:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get security events"
    });
  }
}

/**
 * Gets failed login attempts for the authenticated user
 */
export async function getFailedLoginAttemptsController(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    // Check if user is an admin
    const user = await db
      .selectFrom("users")
      .select(["is_admin", "email", "username"])
      .where("id", "=", req.user.id)
      .executeTakeFirst();
    
    if (!user?.is_admin) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden"
      });
    }
    
    const { limit = 100, offset = 0, username } = req.query;
    
    // Build the query
    let query = db
      .selectFrom("failed_login_attempts")
      .selectAll()
      .orderBy("attempted_at", "desc")
      .limit(Number(limit))
      .offset(Number(offset));
    
    // Add username filter if provided
    if (username) {
      query = query.where("username_or_email", "=", username as string);
    }
    
    const attempts = await query.execute();
    
    return res.status(200).json({
      status: "success",
      data: attempts
    });
  } catch (error) {
    console.error("Error getting failed login attempts:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get failed login attempts"
    });
  }
}
