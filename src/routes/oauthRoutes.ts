import express, { Router } from "express";
import {
  googleAuthController,
  googleCallbackController,
  githubAuthController,
  githubCallbackController
} from "../controller/oauthController";

const router: Router = express.Router();

// Google OAuth routes
router.get("/google", googleAuthController);
router.get("/google/callback", googleCallbackController);

// GitHub OAuth routes
router.get("/github", githubAuthController);
router.get("/github/callback", githubCallbackController);

export default router;
