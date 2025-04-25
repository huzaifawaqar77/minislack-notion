import express, { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  createProjectController,
  getProjectController,
  getWorkspaceProjectsController,
  getUserProjectsController,
  updateProjectController,
  deleteProjectController,
  archiveProjectController,
  unarchiveProjectController,
  getProjectMembersController,
  addProjectMemberController,
  removeProjectMemberController,
  updateProjectMemberRoleController,
} from "../controller/projectController";
import {
  createTaskController,
  getTaskController,
  getProjectTasksController,
  getUserTasksController,
  updateTaskController,
  deleteTaskController,
  archiveTaskController,
  unarchiveTaskController,
  getTaskActivityController,
  createTaskCommentController,
  getTaskCommentsController,
  createTaskLabelController,
  getProjectLabelsController,
  assignLabelToTaskController,
  removeLabelFromTaskController,
  getTaskLabelsController,
} from "../controller/taskController";

const router: Router = express.Router();

// Project routes
router.post("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await createProjectController(req, res);
});

router.get("/user", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await getUserProjectsController(req, res);
});

router.get("/workspace/:workspaceId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await getWorkspaceProjectsController(req, res);
});

router.get("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await getProjectController(req, res);
});

router.put("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await updateProjectController(req, res);
});

router.delete("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await deleteProjectController(req, res);
});

router.put("/:id/archive", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await archiveProjectController(req, res);
});

router.put("/:id/unarchive", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await unarchiveProjectController(req, res);
});

// Project members routes
router.get("/:id/members", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await getProjectMembersController(req, res);
});

router.post("/:id/members", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await addProjectMemberController(req, res);
});

router.delete("/:id/members/:userId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await removeProjectMemberController(req, res);
});

router.put("/:id/members/:userId/role", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await updateProjectMemberRoleController(req, res);
});

// Task routes
router.post("/tasks", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await createTaskController(req, res);
});

router.get("/tasks/user", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await getUserTasksController(req, res);
});

router.get("/:projectId/tasks", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await getProjectTasksController(req, res);
});

router.get("/tasks/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await getTaskController(req, res);
});

router.put("/tasks/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await updateTaskController(req, res);
});

router.delete("/tasks/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await deleteTaskController(req, res);
});

router.put("/tasks/:id/archive", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await archiveTaskController(req, res);
});

router.put("/tasks/:id/unarchive", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await unarchiveTaskController(req, res);
});

// Task activity and comments
router.get("/tasks/:id/activity", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await getTaskActivityController(req, res);
});

router.post("/tasks/:id/comments", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await createTaskCommentController(req, res);
});

router.get("/tasks/:id/comments", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await getTaskCommentsController(req, res);
});

// Task labels
router.post("/:projectId/labels", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await createTaskLabelController(req, res);
});

router.get("/:projectId/labels", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await getProjectLabelsController(req, res);
});

router.post("/tasks/:id/labels/:labelId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await assignLabelToTaskController(req, res);
});

router.delete("/tasks/:id/labels/:labelId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await removeLabelFromTaskController(req, res);
});

router.get("/tasks/:id/labels", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await getTaskLabelsController(req, res);
});

export default router;
