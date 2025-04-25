import { db } from "../db/database";
import crypto from "crypto";
import { isProjectMember } from "./projectRepository";

/**
 * Interface for task creation
 */
export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  projectId: string;
  assignedTo?: string;
  dueDate?: string;
  parentId?: string;
  position?: number;
  createdBy: string; // User ID
}

/**
 * Interface for task update
 */
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedTo?: string | null;
  dueDate?: string | null;
  position?: number;
}

/**
 * Creates a new task
 *
 * @param input - The task creation input
 * @returns The created task
 */
export async function createTask(input: CreateTaskInput) {
  // Check if user is a member of the project
  const isMember = await isProjectMember(input.projectId, input.createdBy);
  if (!isMember) {
    throw new Error("User is not a member of the project");
  }

  // Create the task
  const task = await db
    .insertInto("project_tasks")
    .values({
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description || null,
      status: input.status || "todo",
      priority: input.priority || "medium",
      project_id: input.projectId,
      assigned_to: input.assignedTo || null,
      due_date: input.dueDate ? new Date(input.dueDate).toISOString() : null,
      parent_id: input.parentId || null,
      position: input.position || 0,
      created_by: input.createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  // Log task creation activity
  await createTaskActivity(task.id, input.createdBy, "created", {
    title: task.title,
  });

  return task;
}

/**
 * Gets a task by ID
 *
 * @param id - The ID of the task
 * @returns The task or null if not found
 */
export async function getTaskById(id: string) {
  return db
    .selectFrom("project_tasks")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

/**
 * Gets all tasks in a project
 *
 * @param projectId - The ID of the project
 * @returns Array of tasks
 */
export async function getProjectTasks(projectId: string) {
  return db
    .selectFrom("project_tasks")
    .selectAll()
    .where("project_id", "=", projectId)
    .where("deleted_at", "is", null)
    .orderBy("position", "asc")
    .orderBy("created_at", "asc")
    .execute();
}

/**
 * Gets all tasks assigned to a user
 *
 * @param userId - The ID of the user
 * @returns Array of tasks
 */
export async function getUserTasks(userId: string) {
  return db
    .selectFrom("project_tasks")
    .leftJoin("projects", "projects.id", "project_tasks.project_id")
    .select([
      "project_tasks.id",
      "project_tasks.title",
      "project_tasks.description",
      "project_tasks.status",
      "project_tasks.priority",
      "project_tasks.due_date",
      "project_tasks.created_at",
      "project_tasks.updated_at",
      "projects.id as project_id",
      "projects.name as project_name",
    ])
    .where("project_tasks.assigned_to", "=", userId)
    .where("project_tasks.deleted_at", "is", null)
    .where("projects.deleted_at", "is", null)
    .orderBy("project_tasks.due_date", "asc")
    .execute();
}

/**
 * Updates a task
 *
 * @param id - The ID of the task
 * @param input - The task update input
 * @param userId - The ID of the user making the update
 * @returns The updated task
 */
export async function updateTask(
  id: string,
  input: UpdateTaskInput,
  userId: string
) {
  // Get the current task state
  const currentTask = await getTaskById(id);
  if (!currentTask) {
    throw new Error("Task not found");
  }

  const updateValues: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  // Track changes for activity log
  const changes: Record<string, { from: any; to: any }> = {};

  if (input.title !== undefined) {
    updateValues.title = input.title;
    changes.title = { from: currentTask.title, to: input.title };
  }

  if (input.description !== undefined) {
    updateValues.description = input.description;
    changes.description = {
      from: currentTask.description,
      to: input.description,
    };
  }

  if (input.status !== undefined) {
    updateValues.status = input.status;
    changes.status = { from: currentTask.status, to: input.status };

    // If status changed to completed, set completed_at
    if (input.status === "completed" && currentTask.status !== "completed") {
      updateValues.completed_at = new Date().toISOString();
      changes.completed_at = { from: null, to: updateValues.completed_at };
    }
    // If status changed from completed, clear completed_at
    else if (
      input.status !== "completed" &&
      currentTask.status === "completed"
    ) {
      updateValues.completed_at = null;
      changes.completed_at = {
        from: currentTask.completed_at,
        to: null,
      };
    }
  }

  if (input.priority !== undefined) {
    updateValues.priority = input.priority;
    changes.priority = { from: currentTask.priority, to: input.priority };
  }

  if (input.assignedTo !== undefined) {
    updateValues.assigned_to = input.assignedTo;
    changes.assigned_to = { from: currentTask.assigned_to, to: input.assignedTo };
  }

  if (input.dueDate !== undefined) {
    updateValues.due_date = input.dueDate
      ? new Date(input.dueDate).toISOString()
      : null;
    changes.due_date = { from: currentTask.due_date, to: updateValues.due_date };
  }

  if (input.position !== undefined) {
    updateValues.position = input.position;
    changes.position = { from: currentTask.position, to: input.position };
  }

  // Update the task
  const updatedTask = await db
    .updateTable("project_tasks")
    .set(updateValues)
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirstOrThrow();

  // Log task update activity
  if (Object.keys(changes).length > 0) {
    await createTaskActivity(id, userId, "updated", changes);
  }

  return updatedTask;
}

/**
 * Deletes a task (soft delete)
 *
 * @param id - The ID of the task
 * @param userId - The ID of the user deleting the task
 * @returns True if successful
 */
export async function deleteTask(id: string, userId: string) {
  await db
    .updateTable("project_tasks")
    .set({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .execute();

  // Log task deletion activity
  await createTaskActivity(id, userId, "deleted", {});

  return true;
}

/**
 * Archives a task
 *
 * @param id - The ID of the task
 * @param userId - The ID of the user archiving the task
 * @returns The updated task
 */
export async function archiveTask(id: string, userId: string) {
  const updatedTask = await db
    .updateTable("project_tasks")
    .set({
      is_archived: true,
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirstOrThrow();

  // Log task archive activity
  await createTaskActivity(id, userId, "archived", {});

  return updatedTask;
}

/**
 * Unarchives a task
 *
 * @param id - The ID of the task
 * @param userId - The ID of the user unarchiving the task
 * @returns The updated task
 */
export async function unarchiveTask(id: string, userId: string) {
  const updatedTask = await db
    .updateTable("project_tasks")
    .set({
      is_archived: false,
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirstOrThrow();

  // Log task unarchive activity
  await createTaskActivity(id, userId, "unarchived", {});

  return updatedTask;
}

/**
 * Creates a task activity log entry
 *
 * @param taskId - The ID of the task
 * @param userId - The ID of the user
 * @param action - The action performed
 * @param details - Additional details
 * @returns The created activity
 */
export async function createTaskActivity(
  taskId: string,
  userId: string,
  action: string,
  details: Record<string, any>
) {
  return db
    .insertInto("project_task_activity")
    .values({
      id: crypto.randomUUID(),
      task_id: taskId,
      user_id: userId,
      action,
      details: details,
      created_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Gets task activity for a task
 *
 * @param taskId - The ID of the task
 * @returns Array of activity logs
 */
export async function getTaskActivity(taskId: string) {
  return db
    .selectFrom("project_task_activity")
    .leftJoin("users", "users.id", "project_task_activity.user_id")
    .select([
      "project_task_activity.id",
      "project_task_activity.action",
      "project_task_activity.details",
      "project_task_activity.created_at",
      "users.id as user_id",
      "users.username",
      "users.first_name",
      "users.last_name",
      "users.avatar_url",
    ])
    .where("project_task_activity.task_id", "=", taskId)
    .orderBy("project_task_activity.created_at", "desc")
    .execute();
}

/**
 * Creates a comment on a task
 *
 * @param taskId - The ID of the task
 * @param userId - The ID of the user
 * @param content - The comment content
 * @returns The created comment
 */
export async function createTaskComment(
  taskId: string,
  userId: string,
  content: string
) {
  // Check if user is a member of the project
  const task = await getTaskById(taskId);
  if (!task) {
    throw new Error("Task not found");
  }

  const isMember = await isProjectMember(task.project_id, userId);
  if (!isMember) {
    throw new Error("User is not a member of the project");
  }

  const comment = await db
    .insertInto("project_task_comments")
    .values({
      id: crypto.randomUUID(),
      task_id: taskId,
      user_id: userId,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  // Log comment activity
  await createTaskActivity(taskId, userId, "commented", {
    comment_id: comment.id,
  });

  return comment;
}

/**
 * Gets comments for a task
 *
 * @param taskId - The ID of the task
 * @returns Array of comments
 */
export async function getTaskComments(taskId: string) {
  return db
    .selectFrom("project_task_comments")
    .leftJoin("users", "users.id", "project_task_comments.user_id")
    .select([
      "project_task_comments.id",
      "project_task_comments.content",
      "project_task_comments.created_at",
      "project_task_comments.updated_at",
      "users.id as user_id",
      "users.username",
      "users.first_name",
      "users.last_name",
      "users.avatar_url",
    ])
    .where("project_task_comments.task_id", "=", taskId)
    .where("project_task_comments.deleted_at", "is", null)
    .orderBy("project_task_comments.created_at", "asc")
    .execute();
}

/**
 * Updates a task comment
 *
 * @param id - The ID of the comment
 * @param content - The new content
 * @returns The updated comment
 */
export async function updateTaskComment(id: string, content: string) {
  return db
    .updateTable("project_task_comments")
    .set({
      content,
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Deletes a task comment (soft delete)
 *
 * @param id - The ID of the comment
 * @returns True if successful
 */
export async function deleteTaskComment(id: string) {
  await db
    .updateTable("project_task_comments")
    .set({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .execute();

  return true;
}

/**
 * Creates a task label
 *
 * @param projectId - The ID of the project
 * @param name - The label name
 * @param color - The label color
 * @param createdBy - The ID of the user creating the label
 * @returns The created label
 */
export async function createTaskLabel(
  projectId: string,
  name: string,
  color: string,
  createdBy: string
) {
  return db
    .insertInto("project_task_labels")
    .values({
      id: crypto.randomUUID(),
      name,
      color,
      project_id: projectId,
      created_by: createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Gets labels for a project
 *
 * @param projectId - The ID of the project
 * @returns Array of labels
 */
export async function getProjectLabels(projectId: string) {
  return db
    .selectFrom("project_task_labels")
    .selectAll()
    .where("project_id", "=", projectId)
    .orderBy("name", "asc")
    .execute();
}

/**
 * Updates a task label
 *
 * @param id - The ID of the label
 * @param name - The new name
 * @param color - The new color
 * @returns The updated label
 */
export async function updateTaskLabel(
  id: string,
  name?: string,
  color?: string
) {
  const updateValues: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (name !== undefined) {
    updateValues.name = name;
  }

  if (color !== undefined) {
    updateValues.color = color;
  }

  return db
    .updateTable("project_task_labels")
    .set(updateValues)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Deletes a task label
 *
 * @param id - The ID of the label
 * @returns True if successful
 */
export async function deleteTaskLabel(id: string) {
  // First delete all label assignments
  await db
    .deleteFrom("project_task_label_assignments")
    .where("label_id", "=", id)
    .execute();

  // Then delete the label
  await db.deleteFrom("project_task_labels").where("id", "=", id).execute();

  return true;
}

/**
 * Assigns a label to a task
 *
 * @param taskId - The ID of the task
 * @param labelId - The ID of the label
 * @returns The created assignment
 */
export async function assignLabelToTask(taskId: string, labelId: string) {
  // Check if assignment already exists
  const existingAssignment = await db
    .selectFrom("project_task_label_assignments")
    .select(["id"])
    .where("task_id", "=", taskId)
    .where("label_id", "=", labelId)
    .executeTakeFirst();

  if (existingAssignment) {
    return existingAssignment;
  }

  return db
    .insertInto("project_task_label_assignments")
    .values({
      id: crypto.randomUUID(),
      task_id: taskId,
      label_id: labelId,
      created_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Removes a label from a task
 *
 * @param taskId - The ID of the task
 * @param labelId - The ID of the label
 * @returns True if successful
 */
export async function removeLabelFromTask(taskId: string, labelId: string) {
  await db
    .deleteFrom("project_task_label_assignments")
    .where("task_id", "=", taskId)
    .where("label_id", "=", labelId)
    .execute();

  return true;
}

/**
 * Gets labels for a task
 *
 * @param taskId - The ID of the task
 * @returns Array of labels
 */
export async function getTaskLabels(taskId: string) {
  return db
    .selectFrom("project_task_label_assignments")
    .innerJoin(
      "project_task_labels",
      "project_task_labels.id",
      "project_task_label_assignments.label_id"
    )
    .select([
      "project_task_labels.id",
      "project_task_labels.name",
      "project_task_labels.color",
    ])
    .where("project_task_label_assignments.task_id", "=", taskId)
    .orderBy("project_task_labels.name", "asc")
    .execute();
}
