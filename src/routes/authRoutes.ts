import express, { Router, Request, Response } from "express";
import {
  loginController,
  registerController,
  oauthSuccessController,
  oauthErrorController,
} from "../controller/authController";
import {
  getProfileController,
  updateProfileController,
  updateAvatarController,
} from "../controller/profileController";
import {
  authenticateToken,
  AuthenticatedRequest,
} from "../middleware/authMiddleware";
import multer from "multer";

const router: Router = express.Router();

// Register a new user
router.post("/register", async (req: Request, res: Response) => {
  registerController(req, res);
});

// Login a user
router.post("/login", async (req: Request, res: Response) => {
  await loginController(req, res);
});

// OAuth success handler
router.get("/oauth-success", async (req: Request, res: Response) => {
  await oauthSuccessController(req, res);
});

// OAuth error handler
router.get("/oauth-error", (req: Request, res: Response) => {
  oauthErrorController(req, res);
});

// Configure multer for avatar uploads
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Profile routes
router.get(
  "/me",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    await getProfileController(req, res);
  }
);

router.put(
  "/me",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    await updateProfileController(req, res);
  }
);

router.post(
  "/me/avatar",
  authenticateToken,
  avatarUpload.single("avatar"),
  async (req: AuthenticatedRequest, res: Response) => {
    await updateAvatarController(req, res);
  }
);

export default router;
