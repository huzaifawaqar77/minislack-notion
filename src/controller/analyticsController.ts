import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import * as analyticsRepository from "../repositories/analyticsRepository";

/**
 * Gets workspace activity statistics
 */
export async function getWorkspaceStatsController(req: AuthenticatedRequest, res: Response) {
  try {
    const { workspaceId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const stats = await analyticsRepository.getWorkspaceActivityStats(
      workspaceId,
      req.user.id,
      startDate as string | undefined,
      endDate as string | undefined
    );
    
    return res.status(200).json({
      status: "success",
      data: stats
    });
  } catch (error: any) {
    console.error("Error getting workspace statistics:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to get workspace statistics"
    });
  }
}

/**
 * Gets user activity statistics
 */
export async function getUserStatsController(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req.params;
    const { workspaceId, startDate, endDate } = req.query;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const stats = await analyticsRepository.getUserActivityStats(
      userId,
      req.user.id,
      workspaceId as string | undefined,
      startDate as string | undefined,
      endDate as string | undefined
    );
    
    return res.status(200).json({
      status: "success",
      data: stats
    });
  } catch (error: any) {
    console.error("Error getting user statistics:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to get user statistics"
    });
  }
}

/**
 * Gets channel activity statistics
 */
export async function getChannelStatsController(req: AuthenticatedRequest, res: Response) {
  try {
    const { channelId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const stats = await analyticsRepository.getChannelActivityStats(
      channelId,
      req.user.id,
      startDate as string | undefined,
      endDate as string | undefined
    );
    
    return res.status(200).json({
      status: "success",
      data: stats
    });
  } catch (error: any) {
    console.error("Error getting channel statistics:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to get channel statistics"
    });
  }
}
