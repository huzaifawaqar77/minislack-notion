import express, { Router, Request, Response } from "express";
import { getUserSessions, deactivateSession } from "../repositories/sessionRepository";
import { authenticateToken, AuthenticatedRequest } from "../middleware/authMiddleware";

const router: Router = express.Router();

// Get all active sessions for the authenticated user
router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    
    const sessions = await getUserSessions(req.user.id);
    res.status(200).json({
      status: "success",
      data: sessions
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch sessions"
    });
  }
});

// Logout from a specific session (deactivate it)
router.delete("/:sessionId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    
    const { sessionId } = req.params;
    await deactivateSession(sessionId);
    
    res.status(200).json({
      status: "success",
      message: "Session terminated successfully"
    });
  } catch (error) {
    console.error("Error terminating session:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to terminate session"
    });
  }
});

export default router;
