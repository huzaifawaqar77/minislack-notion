import express from "express";
import {
  getUserById,
  getAllUsers,
  updateUserStatus,
} from "../controllers/userController";
import { searchUsersController } from "../controller/userSearchController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

// Apply authentication middleware to all user routes
router.use(authenticateToken);

// Search users
router.get("/search", searchUsersController);

// Get all users
router.get("/", getAllUsers);

// Get a user by ID
router.get("/:userId", getUserById);

// Update a user's status
router.patch("/:userId/status", updateUserStatus);

export default router;
