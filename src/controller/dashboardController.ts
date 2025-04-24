import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import * as dashboardRepository from "../repositories/dashboardRepository";
import { isWorkspaceMember } from "../repositories/workspaceRepository";

/**
 * Gets dashboard statistics for a workspace
 */
export async function getWorkspaceDashboardStatsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { workspaceId } = req.params;

    console.log("Dashboard request received for workspace:", workspaceId);
    console.log("Authenticated user:", req.user);

    if (!req.user?.id) {
      console.log("Unauthorized: No user ID in request");
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    // Check if user is a member of the workspace
    console.log(
      `Checking if user ${req.user.id} is a member of workspace ${workspaceId}`
    );
    const isMember = await isWorkspaceMember(workspaceId, req.user.id);

    if (!isMember) {
      console.log(
        `User ${req.user.id} is not a member of workspace ${workspaceId}`
      );
      return res.status(403).json({
        status: "error",
        message: "You don't have access to this workspace",
      });
    }

    console.log(
      `User ${req.user.id} is a member of workspace ${workspaceId}, fetching stats`
    );
    const stats = await dashboardRepository.getWorkspaceDashboardStats(
      workspaceId,
      req.user.id
    );

    console.log("Dashboard stats retrieved successfully");
    return res.status(200).json({
      status: "success",
      data: stats,
    });
  } catch (error: any) {
    console.error("Error getting dashboard statistics:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to get dashboard statistics",
    });
  }
}
