import express, { Router, Response } from "express";
import multer from "multer";
import { authenticateToken, AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  uploadFileController,
  getWorkspaceFilesController,
  getFileController,
  updateFileController,
  deleteFileController,
  downloadFileController
} from "../controller/fileController";

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

const router: Router = express.Router();

// Workspace file routes
router.post("/workspaces/:workspaceId/files", 
  authenticateToken, 
  upload.single('file'), 
  async (req: AuthenticatedRequest, res: Response) => {
    await uploadFileController(req, res);
  }
);

router.get("/workspaces/:workspaceId/files", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await getWorkspaceFilesController(req, res);
  }
);

// File-specific routes
router.get("/files/:fileId", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await getFileController(req, res);
  }
);

router.put("/files/:fileId", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await updateFileController(req, res);
  }
);

router.delete("/files/:fileId", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await deleteFileController(req, res);
  }
);

router.get("/files/:fileId/download", 
  authenticateToken, 
  async (req: AuthenticatedRequest, res: Response) => {
    await downloadFileController(req, res);
  }
);

export default router;
