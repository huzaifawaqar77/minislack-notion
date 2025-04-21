import express, { Router, Request, Response } from "express";
import {
  loginController,
  registerController,
  oauthSuccessController,
  oauthErrorController,
} from "../controller/authController";

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

export default router;
