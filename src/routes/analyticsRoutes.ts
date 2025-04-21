import express, { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/authMiddleware";
import { requireWorkspacePermission, requireChannelPermission } from "../middleware/permissionMiddleware";
import { PermissionAction } from "../services/permissionService";
import {
  getWorkspaceStatsController,
  getUserStatsController,
  getChannelStatsController
} from "../controller/analyticsController";

const router: Router = express.Router();

// Workspace analytics routes
router.get("/workspaces/:workspaceId/analytics", 
  authenticateToken, 
  requireWorkspacePermission(PermissionAction.MANAGE_SETTINGS),
  async (req: AuthenticatedRequest, res: Response) => {
    await getWorkspaceStatsController(req, res);
  }
);

// User analytics routes
router.get("/users/:userId/analytics", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await getUserStatsController(req, res);
  }
);

// Channel analytics routes
router.get("/channels/:channelId/analytics", 
  authenticateToken, 
  requireChannelPermission(PermissionAction.MANAGE_SETTINGS),
  async (req: AuthenticatedRequest, res: Response) => {
    await getChannelStatsController(req, res);
  }
);

export default router;
