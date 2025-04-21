import express, { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/authMiddleware";
import { DomainRequest } from "../middleware/domainMiddleware";
import {
  createWorkspaceController,
  getWorkspacesController,
  getWorkspaceController,
  updateWorkspaceController,
  deleteWorkspaceController,
  getWorkspaceMembersController,
  addWorkspaceMemberController,
  removeWorkspaceMemberController,
  updateWorkspaceMemberRoleController
} from "../controller/workspaceController";

const router: Router = express.Router();

// Workspace routes
router.post("/", authenticateToken, async (req: AuthenticatedRequest & DomainRequest, res: Response) => {
  await createWorkspaceController(req, res);
});

router.get("/", authenticateToken, async (req: AuthenticatedRequest & DomainRequest, res: Response) => {
  await getWorkspacesController(req, res);
});

router.get("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await getWorkspaceController(req, res);
});

router.put("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await updateWorkspaceController(req, res);
});

router.delete("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await deleteWorkspaceController(req, res);
});

// Workspace member routes
router.get("/:id/members", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await getWorkspaceMembersController(req, res);
});

router.post("/:id/members", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await addWorkspaceMemberController(req, res);
});

router.delete("/:id/members/:userId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await removeWorkspaceMemberController(req, res);
});

router.put("/:id/members/:userId/role", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await updateWorkspaceMemberRoleController(req, res);
});

export default router;
