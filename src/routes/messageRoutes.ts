import express, { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  createMessageController,
  getChannelMessagesController,
  getMessageRepliesController,
  updateMessageController,
  deleteMessageController,
  addReactionController,
  removeReactionController,
  getReactionsController
} from "../controller/messageController";

const router: Router = express.Router();

// Channel messages
router.post("/channels/:channelId/messages", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await createMessageController(req, res);
});

router.get("/channels/:channelId/messages", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await getChannelMessagesController(req, res);
});

// Message-specific routes
router.get("/messages/:messageId/replies", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await getMessageRepliesController(req, res);
});

router.put("/messages/:messageId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await updateMessageController(req, res);
});

router.delete("/messages/:messageId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await deleteMessageController(req, res);
});

// Reaction routes
router.post("/messages/:messageId/reactions", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await addReactionController(req, res);
});

router.delete("/messages/:messageId/reactions/:emoji", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await removeReactionController(req, res);
});

router.get("/messages/:messageId/reactions", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await getReactionsController(req, res);
});

export default router;
