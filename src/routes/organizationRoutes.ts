import express, { Router, Request, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  createOrganizationController,
  getOrganizationController,
  updateOrganizationController,
  addDomainController,
  getDomainsController,
  verifyDomainController,
  updateSettingsController,
  getSettingsController
} from "../controller/organizationController";

const router: Router = express.Router();

// Organization routes
router.post("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await createOrganizationController(req, res);
});

router.get("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await getOrganizationController(req, res);
});

router.put("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await updateOrganizationController(req, res);
});

// Domain routes
router.post("/:organizationId/domains", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await addDomainController(req, res);
});

router.get("/:organizationId/domains", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await getDomainsController(req, res);
});

router.get("/domains/verify", async (req: Request, res: Response) => {
  await verifyDomainController(req, res);
});

// Settings routes
router.put("/:organizationId/settings", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await updateSettingsController(req, res);
});

router.get("/:organizationId/settings", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await getSettingsController(req, res);
});

export default router;
