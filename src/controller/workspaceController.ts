import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { DomainRequest } from "../middleware/domainMiddleware";
import * as workspaceRepository from "../repositories/workspaceRepository";

/**
 * Creates a new workspace
 */
export async function createWorkspaceController(req: AuthenticatedRequest & DomainRequest, res: Response) {
  try {
    const { name, description, iconUrl, bannerUrl, isPublic } = req.body;
    
    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Workspace name is required"
      });
    }
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    // Get organization ID from domain context if available
    const organizationId = req.organization?.id;
    
    const workspace = await workspaceRepository.createWorkspace({
      name,
      description,
      iconUrl,
      bannerUrl,
      isPublic,
      createdBy: req.user.id,
      organizationId
    });
    
    return res.status(201).json({
      status: "success",
      data: workspace
    });
  } catch (error: any) {
    console.error("Error creating workspace:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to create workspace"
    });
  }
}

/**
 * Gets all workspaces for the current user
 */
export async function getWorkspacesController(req: AuthenticatedRequest & DomainRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    // Get organization ID from domain context if available
    const organizationId = req.organization?.id;
    
    const workspaces = await workspaceRepository.getWorkspacesForUser(req.user.id, organizationId);
    
    return res.status(200).json({
      status: "success",
      data: workspaces
    });
  } catch (error: any) {
    console.error("Error getting workspaces:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get workspaces"
    });
  }
}

/**
 * Gets a workspace by ID
 */
export async function getWorkspaceController(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    // Check if user is a member of the workspace
    const isMember = await workspaceRepository.isWorkspaceMember(id, req.user.id);
    
    if (!isMember) {
      return res.status(403).json({
        status: "error",
        message: "You don't have access to this workspace"
      });
    }
    
    const workspace = await workspaceRepository.getWorkspaceById(id);
    
    if (!workspace) {
      return res.status(404).json({
        status: "error",
        message: "Workspace not found"
      });
    }
    
    return res.status(200).json({
      status: "success",
      data: workspace
    });
  } catch (error: any) {
    console.error("Error getting workspace:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get workspace"
    });
  }
}

/**
 * Updates a workspace
 */
export async function updateWorkspaceController(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, iconUrl, bannerUrl, isPublic } = req.body;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    // Check if user is an admin of the workspace
    const role = await workspaceRepository.getWorkspaceRole(id, req.user.id);
    
    if (!role || role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "You don't have permission to update this workspace"
      });
    }
    
    const workspace = await workspaceRepository.updateWorkspace(id, {
      name,
      description,
      iconUrl,
      bannerUrl,
      isPublic
    });
    
    return res.status(200).json({
      status: "success",
      data: workspace
    });
  } catch (error: any) {
    console.error("Error updating workspace:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to update workspace"
    });
  }
}

/**
 * Deletes a workspace
 */
export async function deleteWorkspaceController(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    // Check if user is an admin of the workspace
    const role = await workspaceRepository.getWorkspaceRole(id, req.user.id);
    
    if (!role || role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "You don't have permission to delete this workspace"
      });
    }
    
    await workspaceRepository.deleteWorkspace(id);
    
    return res.status(200).json({
      status: "success",
      message: "Workspace deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting workspace:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to delete workspace"
    });
  }
}

/**
 * Gets all members of a workspace
 */
export async function getWorkspaceMembersController(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    // Check if user is a member of the workspace
    const isMember = await workspaceRepository.isWorkspaceMember(id, req.user.id);
    
    if (!isMember) {
      return res.status(403).json({
        status: "error",
        message: "You don't have access to this workspace"
      });
    }
    
    const members = await workspaceRepository.getWorkspaceMembers(id);
    
    return res.status(200).json({
      status: "success",
      data: members
    });
  } catch (error: any) {
    console.error("Error getting workspace members:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get workspace members"
    });
  }
}

/**
 * Adds a member to a workspace
 */
export async function addWorkspaceMemberController(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required"
      });
    }
    
    // Check if user is an admin of the workspace
    const userRole = await workspaceRepository.getWorkspaceRole(id, req.user.id);
    
    if (!userRole || userRole !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "You don't have permission to add members to this workspace"
      });
    }
    
    const member = await workspaceRepository.addWorkspaceMember(id, userId, role || "member");
    
    return res.status(201).json({
      status: "success",
      data: member
    });
  } catch (error: any) {
    console.error("Error adding workspace member:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to add workspace member"
    });
  }
}

/**
 * Removes a member from a workspace
 */
export async function removeWorkspaceMemberController(req: AuthenticatedRequest, res: Response) {
  try {
    const { id, userId } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    // Check if user is an admin of the workspace or removing themselves
    const userRole = await workspaceRepository.getWorkspaceRole(id, req.user.id);
    
    if ((!userRole || userRole !== "admin") && req.user.id !== userId) {
      return res.status(403).json({
        status: "error",
        message: "You don't have permission to remove this member"
      });
    }
    
    await workspaceRepository.removeWorkspaceMember(id, userId);
    
    return res.status(200).json({
      status: "success",
      message: "Member removed successfully"
    });
  } catch (error: any) {
    console.error("Error removing workspace member:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to remove workspace member"
    });
  }
}

/**
 * Updates a member's role in a workspace
 */
export async function updateWorkspaceMemberRoleController(req: AuthenticatedRequest, res: Response) {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    if (!role) {
      return res.status(400).json({
        status: "error",
        message: "Role is required"
      });
    }
    
    // Check if user is an admin of the workspace
    const userRole = await workspaceRepository.getWorkspaceRole(id, req.user.id);
    
    if (!userRole || userRole !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "You don't have permission to update member roles"
      });
    }
    
    const member = await workspaceRepository.updateWorkspaceMemberRole(id, userId, role);
    
    return res.status(200).json({
      status: "success",
      data: member
    });
  } catch (error: any) {
    console.error("Error updating workspace member role:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to update workspace member role"
    });
  }
}
