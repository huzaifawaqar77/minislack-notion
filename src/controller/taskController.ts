import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import * as taskRepository from "../repositories/taskRepository";
import * as projectRepository from "../repositories/projectRepository";
import { logAuditEvent } from "../services/auditService";

/**
 * Creates a new task
 */
export async function createTaskController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const {
      title,
      description,
      status,
      priority,
      projectId,
      assignedTo,
      dueDate,
      parentId,
      position,
    } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Title and project ID are required",
      });
    }

    // Check if project exists
    const project = await projectRepository.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is a member of the project
    const isMember = await projectRepository.isProjectMember(
      projectId,
      req.user.id
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this project",
      });
    }

    const task = await taskRepository.createTask({
      title,
      description,
      status,
      priority,
      projectId,
      assignedTo,
      dueDate,
      parentId,
      position,
      createdBy: req.user.id,
    });

    // Log audit event
    await logAuditEvent({
      userId: req.user.id,
      action: "task.create",
      entityType: "task",
      entityId: task.id,
      workspaceId: project.workspace_id,
      details: { title: task.title, projectId },
    });

    return res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    console.error("Error creating task:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create task",
    });
  }
}

/**
 * Gets a task by ID
 */
export async function getTaskController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    const task = await taskRepository.getTaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is a member of the project
    const project = await projectRepository.getProjectById(task.project_id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isMember = await projectRepository.isProjectMember(
      task.project_id,
      req.user.id
    );
    if (!isMember && !project.is_public) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this task",
      });
    }

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    console.error("Error getting task:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get task",
    });
  }
}

/**
 * Gets all tasks in a project
 */
export async function getProjectTasksController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { projectId } = req.params;

    // Check if project exists
    const project = await projectRepository.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is a member of the project
    const isMember = await projectRepository.isProjectMember(
      projectId,
      req.user.id
    );
    if (!isMember && !project.is_public) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this project",
      });
    }

    const tasks = await taskRepository.getProjectTasks(projectId);

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    console.error("Error getting project tasks:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get project tasks",
    });
  }
}

/**
 * Gets all tasks assigned to a user
 */
export async function getUserTasksController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const tasks = await taskRepository.getUserTasks(req.user.id);

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    console.error("Error getting user tasks:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get user tasks",
    });
  }
}

/**
 * Updates a task
 */
export async function updateTaskController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
      position,
    } = req.body;

    // Check if task exists
    const task = await taskRepository.getTaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is a member of the project
    const isMember = await projectRepository.isProjectMember(
      task.project_id,
      req.user.id
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this task",
      });
    }

    const updatedTask = await taskRepository.updateTask(
      id,
      {
        title,
        description,
        status,
        priority,
        assignedTo,
        dueDate,
        position,
      },
      req.user.id
    );

    // Log audit event
    await logAuditEvent({
      userId: req.user.id,
      action: "task.update",
      entityType: "task",
      entityId: id,
      workspaceId: null, // We don't have workspace ID here
      details: { title: updatedTask.title, projectId: task.project_id },
    });

    return res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error: any) {
    console.error("Error updating task:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update task",
    });
  }
}

/**
 * Deletes a task
 */
export async function deleteTaskController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    // Check if task exists
    const task = await taskRepository.getTaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is a member of the project with appropriate permissions
    const userRole = await projectRepository.getProjectRole(
      task.project_id,
      req.user.id
    );
    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this task",
      });
    }

    // Only task creator, project admins, or owners can delete tasks
    if (
      task.created_by !== req.user.id &&
      !["admin", "owner"].includes(userRole)
    ) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this task",
      });
    }

    await taskRepository.deleteTask(id, req.user.id);

    // Log audit event
    await logAuditEvent({
      userId: req.user.id,
      action: "task.delete",
      entityType: "task",
      entityId: id,
      workspaceId: null,
      details: { title: task.title, projectId: task.project_id },
    });

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting task:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete task",
    });
  }
}

/**
 * Archives a task
 */
export async function archiveTaskController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    // Check if task exists
    const task = await taskRepository.getTaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is a member of the project
    const isMember = await projectRepository.isProjectMember(
      task.project_id,
      req.user.id
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this task",
      });
    }

    const archivedTask = await taskRepository.archiveTask(id, req.user.id);

    // Log audit event
    await logAuditEvent({
      userId: req.user.id,
      action: "task.archive",
      entityType: "task",
      entityId: id,
      workspaceId: null,
      details: { title: task.title, projectId: task.project_id },
    });

    return res.status(200).json({
      success: true,
      data: archivedTask,
    });
  } catch (error: any) {
    console.error("Error archiving task:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to archive task",
    });
  }
}

/**
 * Unarchives a task
 */
export async function unarchiveTaskController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    // Check if task exists
    const task = await taskRepository.getTaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is a member of the project
    const isMember = await projectRepository.isProjectMember(
      task.project_id,
      req.user.id
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this task",
      });
    }

    const unarchivedTask = await taskRepository.unarchiveTask(id, req.user.id);

    // Log audit event
    await logAuditEvent({
      userId: req.user.id,
      action: "task.unarchive",
      entityType: "task",
      entityId: id,
      workspaceId: null,
      details: { title: task.title, projectId: task.project_id },
    });

    return res.status(200).json({
      success: true,
      data: unarchivedTask,
    });
  } catch (error: any) {
    console.error("Error unarchiving task:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to unarchive task",
    });
  }
}

/**
 * Gets task activity
 */
export async function getTaskActivityController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    // Check if task exists
    const task = await taskRepository.getTaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is a member of the project
    const project = await projectRepository.getProjectById(task.project_id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isMember = await projectRepository.isProjectMember(
      task.project_id,
      req.user.id
    );
    if (!isMember && !project.is_public) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this task",
      });
    }

    const activity = await taskRepository.getTaskActivity(id);

    return res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error: any) {
    console.error("Error getting task activity:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get task activity",
    });
  }
}

/**
 * Creates a comment on a task
 */
export async function createTaskCommentController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    // Check if task exists
    const task = await taskRepository.getTaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is a member of the project
    const isMember = await projectRepository.isProjectMember(
      task.project_id,
      req.user.id
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this task",
      });
    }

    const comment = await taskRepository.createTaskComment(
      id,
      req.user.id,
      content
    );

    // Log audit event
    await logAuditEvent({
      userId: req.user.id,
      action: "task.comment.create",
      entityType: "task",
      entityId: id,
      workspaceId: null,
      details: { commentId: comment.id, projectId: task.project_id },
    });

    return res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error: any) {
    console.error("Error creating task comment:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create task comment",
    });
  }
}

/**
 * Gets comments for a task
 */
export async function getTaskCommentsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    // Check if task exists
    const task = await taskRepository.getTaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is a member of the project
    const project = await projectRepository.getProjectById(task.project_id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isMember = await projectRepository.isProjectMember(
      task.project_id,
      req.user.id
    );
    if (!isMember && !project.is_public) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this task",
      });
    }

    const comments = await taskRepository.getTaskComments(id);

    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error: any) {
    console.error("Error getting task comments:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get task comments",
    });
  }
}

/**
 * Creates a task label
 */
export async function createTaskLabelController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { projectId } = req.params;
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Label name is required",
      });
    }

    // Check if project exists
    const project = await projectRepository.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is a member of the project
    const userRole = await projectRepository.getProjectRole(
      projectId,
      req.user.id
    );
    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this project",
      });
    }

    const label = await taskRepository.createTaskLabel(
      projectId,
      name,
      color || "#6366F1", // Default indigo color
      req.user.id
    );

    // Log audit event
    await logAuditEvent({
      userId: req.user.id,
      action: "task.label.create",
      entityType: "project",
      entityId: projectId,
      workspaceId: project.workspace_id,
      details: { labelId: label.id, name },
    });

    return res.status(201).json({
      success: true,
      data: label,
    });
  } catch (error: any) {
    console.error("Error creating task label:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create task label",
    });
  }
}

/**
 * Gets labels for a project
 */
export async function getProjectLabelsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { projectId } = req.params;

    // Check if project exists
    const project = await projectRepository.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is a member of the project
    const isMember = await projectRepository.isProjectMember(
      projectId,
      req.user.id
    );
    if (!isMember && !project.is_public) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this project",
      });
    }

    const labels = await taskRepository.getProjectLabels(projectId);

    return res.status(200).json({
      success: true,
      data: labels,
    });
  } catch (error: any) {
    console.error("Error getting project labels:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get project labels",
    });
  }
}

/**
 * Assigns a label to a task
 */
export async function assignLabelToTaskController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id, labelId } = req.params;

    // Check if task exists
    const task = await taskRepository.getTaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is a member of the project
    const isMember = await projectRepository.isProjectMember(
      task.project_id,
      req.user.id
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this task",
      });
    }

    const assignment = await taskRepository.assignLabelToTask(id, labelId);

    // Log audit event
    await logAuditEvent({
      userId: req.user.id,
      action: "task.label.assign",
      entityType: "task",
      entityId: id,
      workspaceId: null,
      details: { labelId, projectId: task.project_id },
    });

    return res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error: any) {
    console.error("Error assigning label to task:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to assign label to task",
    });
  }
}

/**
 * Removes a label from a task
 */
export async function removeLabelFromTaskController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id, labelId } = req.params;

    // Check if task exists
    const task = await taskRepository.getTaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is a member of the project
    const isMember = await projectRepository.isProjectMember(
      task.project_id,
      req.user.id
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this task",
      });
    }

    await taskRepository.removeLabelFromTask(id, labelId);

    // Log audit event
    await logAuditEvent({
      userId: req.user.id,
      action: "task.label.remove",
      entityType: "task",
      entityId: id,
      workspaceId: null,
      details: { labelId, projectId: task.project_id },
    });

    return res.status(200).json({
      success: true,
      message: "Label removed from task successfully",
    });
  } catch (error: any) {
    console.error("Error removing label from task:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove label from task",
    });
  }
}

/**
 * Gets labels for a task
 */
export async function getTaskLabelsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    // Check if task exists
    const task = await taskRepository.getTaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is a member of the project
    const project = await projectRepository.getProjectById(task.project_id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isMember = await projectRepository.isProjectMember(
      task.project_id,
      req.user.id
    );
    if (!isMember && !project.is_public) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this task",
      });
    }

    const labels = await taskRepository.getTaskLabels(id);

    return res.status(200).json({
      success: true,
      data: labels,
    });
  } catch (error: any) {
    console.error("Error getting task labels:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get task labels",
    });
  }
}
