import express, { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/authMiddleware";
import { searchWorkspaceController } from "../controller/searchController";

const router: Router = express.Router();

// Search routes
router.get("/workspaces/:workspaceId/search", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await searchWorkspaceController(req, res);
  }
);

export default router;
