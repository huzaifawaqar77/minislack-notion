import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import * as projectRepository from "../repositories/projectRepository";
import * as taskRepository from "../repositories/taskRepository";
import { logAuditEvent } from "../services/auditService";

/**
 * Creates a new project
 */
export async function createProjectController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { name, description, imageUrl, isPublic, workspaceId } = req.body;

    if (!name || !workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Name and workspace ID are required",
      });
    }

    const project = await projectRepository.createProject({
      name,
      description,
      imageUrl,
      isPublic,
      workspaceId,
      createdBy: req.user.id,
    });

    // Log audit event
    await logAuditEvent({
      userId: req.user.id,
      action: "project.create",
      entityType: "project",
      entityId: project.id,
      workspaceId: project.workspace_id,
      details: { name: project.name },
    });

    return res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    console.error("Error creating project:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create project",
    });
  }
}

/**
 * Gets a project by ID
 */
export async function getProjectController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    const project = await projectRepository.getProjectById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is a member of the project or if the project is public
    const isMember = await projectRepository.isProjectMember(id, req.user.id);
    if (!isMember && !project.is_public) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this project",
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    console.error("Error getting project:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get project",
    });
  }
}

/**
 * Gets all projects in a workspace
 */
export async function getWorkspaceProjectsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { workspaceId } = req.params;

    const projects = await projectRepository.getWorkspaceProjects(workspaceId);

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    console.error("Error getting workspace projects:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get workspace projects",
    });
  }
}

/**
 * Gets all projects a user is a member of
 */
export async function getUserProjectsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const projects = await projectRepository.getUserProjects(req.user.id);

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    console.error("Error getting user projects:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get user projects",
    });
  }
}

/**
 * Updates a project
 */
export async function updateProjectController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, isPublic } = req.body;

    // Check if project exists
    const project = await projectRepository.getProjectById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user has permission to update the project
    const userRole = await projectRepository.getProjectRole(id, req.user.id);
    if (!userRole || !["owner", "admin"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this project",
      });
    }

    const updatedProject = await projectRepository.updateProject(id, {
      name,
      description,
      imageUrl,
      isPublic,
    });

    // Log audit event
    await logAuditEvent({
      userId: req.user.id,
      action: "project.update",
      entityType: "project",
      entityId: id,
      workspaceId: project.workspace_id,
      details: { name: updatedProject.name },
    });

    return res.status(200).json({
      success: true,
      data: updatedProject,
    });
  } catch (error: any) {
    console.error("Error updating project:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update project",
    });
  }
}

/**
 * Deletes a project
 */
export async function deleteProjectController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    // Check if project exists
    const project = await projectRepository.getProjectById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user has permission to delete the project
    const userRole = await projectRepository.getProjectRole(id, req.user.id);
    if (!userRole || userRole !== "owner") {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this project",
      });
    }

    await projectRepository.deleteProject(id);

    // Log audit event
    await logAuditEvent({
      userId: req.user.id,
      action: "project.delete",
      entityType: "project",
      entityId: id,
      workspaceId: project.workspace_id,
      details: { name: project.name },
    });

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting project:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete project",
    });
  }
}

/**
 * Archives a project
 */
export async function archiveProjectController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    // Check if project exists
    const project = await projectRepository.getProjectById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user has permission to archive the project
    const userRole = await projectRepository.getProjectRole(id, req.user.id);
    if (!userRole || !["owner", "admin"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to archive this project",
      });
    }

    const archivedProject = await projectRepository.archiveProject(id);

    // Log audit event
    await logAuditEvent({
      userId: req.user.id,
      action: "project.archive",
      entityType: "project",
      entityId: id,
      workspaceId: project.workspace_id,
      details: { name: project.name },
    });

    return res.status(200).json({
      success: true,
      data: archivedProject,
    });
  } catch (error: any) {
    console.error("Error archiving project:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to archive project",
    });
  }
}

/**
 * Unarchives a project
 */
export async function unarchiveProjectController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    // Check if project exists
    const project = await projectRepository.getProjectById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user has permission to unarchive the project
    const userRole = await projectRepository.getProjectRole(id, req.user.id);
    if (!userRole || !["owner", "admin"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to unarchive this project",
      });
    }

    const unarchivedProject = await projectRepository.unarchiveProject(id);

    // Log audit event
    await logAuditEvent({
      userId: req.user.id,
      action: "project.unarchive",
      entityType: "project",
      entityId: id,
      workspaceId: project.workspace_id,
      details: { name: project.name },
    });

    return res.status(200).json({
      success: true,
      data: unarchivedProject,
    });
  } catch (error: any) {
    console.error("Error unarchiving project:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to unarchive project",
    });
  }
}

/**
 * Gets all members of a project
 */
export async function getProjectMembersController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    // Check if project exists
    const project = await projectRepository.getProjectById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is a member of the project
    const isMember = await projectRepository.isProjectMember(id, req.user.id);
    if (!isMember && !project.is_public) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this project",
      });
    }

    const members = await projectRepository.getProjectMembers(id);

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error: any) {
    console.error("Error getting project members:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get project members",
    });
  }
}

/**
 * Adds a member to a project
 */
export async function addProjectMemberController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if project exists
    const project = await projectRepository.getProjectById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user has permission to add members
    const userRole = await projectRepository.getProjectRole(id, req.user.id);
    if (!userRole || !["owner", "admin"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to add members to this project",
      });
    }

    const member = await projectRepository.addProjectMember(
      id,
      userId,
      role || "member",
      req.user.id
    );

    // Log audit event
    await logAuditEvent({
      userId: req.user.id,
      action: "project.member.add",
      entityType: "project",
      entityId: id,
      workspaceId: project.workspace_id,
      details: { memberId: userId, role: role || "member" },
    });

    return res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error: any) {
    console.error("Error adding project member:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add project member",
    });
  }
}

/**
 * Removes a member from a project
 */
export async function removeProjectMemberController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id, userId } = req.params;

    // Check if project exists
    const project = await projectRepository.getProjectById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user has permission to remove members
    const userRole = await projectRepository.getProjectRole(id, req.user.id);
    if (!userRole || !["owner", "admin"].includes(userRole)) {
      // Allow users to remove themselves
      if (req.user.id !== userId) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to remove members from this project",
        });
      }
    }

    // Check if trying to remove the owner
    const memberRole = await projectRepository.getProjectRole(id, userId);
    if (memberRole === "owner" && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot remove the project owner",
      });
    }

    await projectRepository.removeProjectMember(id, userId);

    // Log audit event
    await logAuditEvent({
      userId: req.user.id,
      action: "project.member.remove",
      entityType: "project",
      entityId: id,
      workspaceId: project.workspace_id,
      details: { memberId: userId },
    });

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error: any) {
    console.error("Error removing project member:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove project member",
    });
  }
}

/**
 * Updates a project member's role
 */
export async function updateProjectMemberRoleController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    // Check if project exists
    const project = await projectRepository.getProjectById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user has permission to update roles
    const userRole = await projectRepository.getProjectRole(id, req.user.id);
    if (!userRole || userRole !== "owner") {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update member roles",
      });
    }

    // Check if trying to update the owner's role
    const memberRole = await projectRepository.getProjectRole(id, userId);
    if (memberRole === "owner" && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot change the owner's role",
      });
    }

    const updatedMember = await projectRepository.updateProjectMemberRole(
      id,
      userId,
      role
    );

    // Log audit event
    await logAuditEvent({
      userId: req.user.id,
      action: "project.member.role.update",
      entityType: "project",
      entityId: id,
      workspaceId: project.workspace_id,
      details: { memberId: userId, role },
    });

    return res.status(200).json({
      success: true,
      data: updatedMember,
    });
  } catch (error: any) {
    console.error("Error updating project member role:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update project member role",
    });
  }
}
