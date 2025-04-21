import express, { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  getUserNotificationsController,
  getUnreadNotificationCountController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
  deleteNotificationController
} from "../controller/notificationController";

const router: Router = express.Router();

// Notification routes
router.get("/notifications", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await getUserNotificationsController(req, res);
  }
);

router.get("/notifications/unread/count", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await getUnreadNotificationCountController(req, res);
  }
);

router.put("/notifications/:notificationId/read", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await markNotificationAsReadController(req, res);
  }
);

router.put("/notifications/read-all", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await markAllNotificationsAsReadController(req, res);
  }
);

router.delete("/notifications/:notificationId", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await deleteNotificationController(req, res);
  }
);

export default router;
