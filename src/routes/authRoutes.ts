import express, { Router, Request, Response } from "express";
import {
  loginController,
  registerController,
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

export default router;
