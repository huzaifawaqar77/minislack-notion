import express, { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/authMiddleware";
import { requireWorkspacePermission } from "../middleware/permissionMiddleware";
import { PermissionAction } from "../services/permissionService";
import {
  createWebhookController,
  getWorkspaceWebhooksController,
  getWebhookController,
  updateWebhookController,
  deleteWebhookController
} from "../controller/webhookController";

const router: Router = express.Router();

// Workspace webhook routes
router.post("/workspaces/:workspaceId/webhooks", 
  authenticateToken, 
  requireWorkspacePermission(PermissionAction.MANAGE_SETTINGS),
  async (req: AuthenticatedRequest, res: Response) => {
    await createWebhookController(req, res);
  }
);

router.get("/workspaces/:workspaceId/webhooks", 
  authenticateToken, 
  requireWorkspacePermission(PermissionAction.VIEW),
  async (req: AuthenticatedRequest, res: Response) => {
    await getWorkspaceWebhooksController(req, res);
  }
);

// Webhook-specific routes
router.get("/webhooks/:webhookId", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await getWebhookController(req, res);
  }
);

router.put("/webhooks/:webhookId", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await updateWebhookController(req, res);
  }
);

router.delete("/webhooks/:webhookId", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await deleteWebhookController(req, res);
  }
);

export default router;
