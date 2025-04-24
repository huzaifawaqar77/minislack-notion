import express, { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/authMiddleware";
import { getWorkspaceDashboardStatsController } from "../controller/dashboardController";

const router: Router = express.Router();

// Dashboard routes
router.get("/workspaces/:workspaceId/dashboard", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await getWorkspaceDashboardStatsController(req, res);
  }
);

export default router;
