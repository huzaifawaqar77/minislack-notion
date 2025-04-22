import express, { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  createOrGetDMChannelController,
  getUserDMChannelsController,
} from "../controller/dmController";

const router: Router = express.Router();

// DM channel routes
router.post("/dm/channels", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await createOrGetDMChannelController(req, res);
});

router.get("/dm/channels", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await getUserDMChannelsController(req, res);
});

export default router;
