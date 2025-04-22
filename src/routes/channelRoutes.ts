import express, { Router, Response } from "express";
import {
  authenticateToken,
  AuthenticatedRequest,
} from "../middleware/authMiddleware";
import {
  createChannelController,
  getChannelsController,
  getChannelController,
  updateChannelController,
  deleteChannelController,
  getChannelMembersController,
  addChannelMemberController,
  removeChannelMemberController,
  markChannelAsReadController,
} from "../controller/channelController";

const router: Router = express.Router();

// Workspace-specific channel routes
router.post(
  "/workspaces/:workspaceId/channels",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    await createChannelController(req, res);
  }
);

router.get(
  "/workspaces/:workspaceId/channels",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    await getChannelsController(req, res);
  }
);

// Channel-specific routes
router.get(
  "/channels/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    await getChannelController(req, res);
  }
);

router.put(
  "/channels/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    await updateChannelController(req, res);
  }
);

router.delete(
  "/channels/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    await deleteChannelController(req, res);
  }
);

// Channel member routes
router.get(
  "/channels/:id/members",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    await getChannelMembersController(req, res);
  }
);

router.post(
  "/channels/:id/members",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    await addChannelMemberController(req, res);
  }
);

router.delete(
  "/channels/:id/members/:userId",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    await removeChannelMemberController(req, res);
  }
);

// Mark channel as read route
router.post(
  "/channels/:channelId/read",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    await markChannelAsReadController(req, res);
  }
);

export default router;
