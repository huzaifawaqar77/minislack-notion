import express, { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  generateCsrfTokenController,
  invalidateCsrfTokenController,
  getSecurityEventsController,
  getFailedLoginAttemptsController
} from "../controller/securityController";

const router: Router = express.Router();

// CSRF token routes
router.post("/csrf-token", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await generateCsrfTokenController(req, res);
  }
);

router.delete("/csrf-token", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await invalidateCsrfTokenController(req, res);
  }
);

// Security events routes (admin only)
router.get("/events", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await getSecurityEventsController(req, res);
  }
);

// Failed login attempts routes (admin only)
router.get("/failed-logins", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await getFailedLoginAttemptsController(req, res);
  }
);

export default router;
