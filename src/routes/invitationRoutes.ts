import express, { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  createInvitationController,
  getWorkspaceInvitationsController,
  getUserInvitationsController,
  getInvitationByTokenController,
  acceptInvitationController,
  declineInvitationController,
  cancelInvitationController,
  resendInvitationController
} from "../controller/invitationController";

const router: Router = express.Router();

// Workspace invitation routes
router.post("/workspaces/:workspaceId/invitations", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await createInvitationController(req, res);
  }
);

router.get("/workspaces/:workspaceId/invitations", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await getWorkspaceInvitationsController(req, res);
  }
);

// User invitation routes
router.get("/invitations/me", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await getUserInvitationsController(req, res);
  }
);

// Public invitation routes
router.get("/invitations/:token", 
  async (req: AuthenticatedRequest, res: Response) => {
    await getInvitationByTokenController(req, res);
  }
);

// Authenticated invitation actions
router.post("/invitations/:token/accept", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await acceptInvitationController(req, res);
  }
);

router.post("/invitations/:token/decline", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await declineInvitationController(req, res);
  }
);

router.delete("/invitations/:invitationId", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await cancelInvitationController(req, res);
  }
);

router.post("/invitations/:invitationId/resend", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await resendInvitationController(req, res);
  }
);

export default router;
