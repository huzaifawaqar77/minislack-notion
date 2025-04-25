import { db } from "../db/database";
import crypto from "crypto";
import { slugify } from "../utils/stringUtils";
import { isWorkspaceMember, getWorkspaceRole } from "./workspaceRepository";

/**
 * Interface for project creation
 */
export interface CreateProjectInput {
  name: string;
  description?: string;
  imageUrl?: string;
  isPublic?: boolean;
  workspaceId: string;
  createdBy: string; // User ID
}

/**
 * Interface for project update
 */
export interface UpdateProjectInput {
  name?: string;
  description?: string;
  imageUrl?: string;
  isPublic?: boolean;
}

/**
 * Creates a new project
 *
 * @param input - The project creation input
 * @returns The created project
 */
export async function createProject(input: CreateProjectInput) {
  // Check if user is a member of the workspace
  const isMember = await isWorkspaceMember(input.workspaceId, input.createdBy);
  if (!isMember) {
    throw new Error("User is not a member of the workspace");
  }

  // Generate a slug from the name
  let slug = slugify(input.name);

  // Check if slug exists
  const existingProject = await db
    .selectFrom("projects")
    .select(["id"])
    .where("workspace_id", "=", input.workspaceId)
    .where("slug", "=", slug)
    .where("deleted_at", "is", null)
    .executeTakeFirst();

  // If slug exists, append a random string
  if (existingProject) {
    slug = `${slug}-${crypto.randomBytes(3).toString("hex")}`;
  }

  // Create the project
  const project = await db
    .insertInto("projects")
    .values({
      id: crypto.randomUUID(),
      name: input.name,
      slug,
      description: input.description || null,
      image_url: input.imageUrl || null,
      is_public: input.isPublic !== undefined ? input.isPublic : false,
      workspace_id: input.workspaceId,
      created_by: input.createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  // Add the creator as a member with owner role
  await db
    .insertInto("project_members")
    .values({
      id: crypto.randomUUID(),
      project_id: project.id,
      user_id: input.createdBy,
      role: "owner",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .execute();

  return project;
}

/**
 * Gets a project by ID
 *
 * @param id - The ID of the project
 * @returns The project or null if not found
 */
export async function getProjectById(id: string) {
  return db
    .selectFrom("projects")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

/**
 * Gets all projects in a workspace
 *
 * @param workspaceId - The ID of the workspace
 * @returns Array of projects
 */
export async function getWorkspaceProjects(workspaceId: string) {
  return db
    .selectFrom("projects")
    .selectAll()
    .where("workspace_id", "=", workspaceId)
    .where("deleted_at", "is", null)
    .orderBy("created_at", "desc")
    .execute();
}

/**
 * Gets all projects a user is a member of
 *
 * @param userId - The ID of the user
 * @returns Array of projects
 */
export async function getUserProjects(userId: string) {
  return db
    .selectFrom("projects")
    .leftJoin("project_members", "project_members.project_id", "projects.id")
    .selectAll("projects")
    .where("project_members.user_id", "=", userId)
    .where("projects.deleted_at", "is", null)
    .orderBy("projects.created_at", "desc")
    .execute();
}

/**
 * Updates a project
 *
 * @param id - The ID of the project
 * @param input - The project update input
 * @returns The updated project
 */
export async function updateProject(id: string, input: UpdateProjectInput) {
  const updateValues: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) {
    updateValues.name = input.name;
  }

  if (input.description !== undefined) {
    updateValues.description = input.description;
  }

  if (input.imageUrl !== undefined) {
    updateValues.image_url = input.imageUrl;
  }

  if (input.isPublic !== undefined) {
    updateValues.is_public = input.isPublic;
  }

  return db
    .updateTable("projects")
    .set(updateValues)
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Deletes a project (soft delete)
 *
 * @param id - The ID of the project
 * @returns True if successful
 */
export async function deleteProject(id: string) {
  await db
    .updateTable("projects")
    .set({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .execute();

  return true;
}

/**
 * Archives a project
 *
 * @param id - The ID of the project
 * @returns The updated project
 */
export async function archiveProject(id: string) {
  return db
    .updateTable("projects")
    .set({
      is_archived: true,
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Unarchives a project
 *
 * @param id - The ID of the project
 * @returns The updated project
 */
export async function unarchiveProject(id: string) {
  return db
    .updateTable("projects")
    .set({
      is_archived: false,
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Gets all members of a project
 *
 * @param projectId - The ID of the project
 * @returns Array of project members with user details
 */
export async function getProjectMembers(projectId: string) {
  return db
    .selectFrom("project_members")
    .innerJoin("users", "users.id", "project_members.user_id")
    .select([
      "project_members.id as membership_id",
      "project_members.role",
      "project_members.created_at as joined_at",
      "users.id as user_id",
      "users.username",
      "users.email",
      "users.first_name",
      "users.last_name",
      "users.avatar_url",
      "users.status",
      "users.last_active",
    ])
    .where("project_members.project_id", "=", projectId)
    .execute();
}

/**
 * Checks if a user is a member of a project
 *
 * @param projectId - The ID of the project
 * @param userId - The ID of the user
 * @returns True if the user is a member
 */
export async function isProjectMember(projectId: string, userId: string) {
  const member = await db
    .selectFrom("project_members")
    .select(["id"])
    .where("project_id", "=", projectId)
    .where("user_id", "=", userId)
    .executeTakeFirst();

  return !!member;
}

/**
 * Gets a user's role in a project
 *
 * @param projectId - The ID of the project
 * @param userId - The ID of the user
 * @returns The user's role or null if not a member
 */
export async function getProjectRole(projectId: string, userId: string) {
  const member = await db
    .selectFrom("project_members")
    .select(["role"])
    .where("project_id", "=", projectId)
    .where("user_id", "=", userId)
    .executeTakeFirst();

  return member?.role || null;
}

/**
 * Adds a member to a project
 *
 * @param projectId - The ID of the project
 * @param userId - The ID of the user
 * @param role - The role to assign
 * @param invitedBy - The ID of the user who invited them
 * @returns The created project member
 */
export async function addProjectMember(
  projectId: string,
  userId: string,
  role: string = "member",
  invitedBy?: string
) {
  // Check if already a member
  const existingMember = await db
    .selectFrom("project_members")
    .select(["id"])
    .where("project_id", "=", projectId)
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (existingMember) {
    throw new Error("User is already a member of this project");
  }

  // Add the member
  return db
    .insertInto("project_members")
    .values({
      id: crypto.randomUUID(),
      project_id: projectId,
      user_id: userId,
      role,
      invited_by: invitedBy || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Removes a member from a project
 *
 * @param projectId - The ID of the project
 * @param userId - The ID of the user
 * @returns True if successful
 */
export async function removeProjectMember(projectId: string, userId: string) {
  await db
    .deleteFrom("project_members")
    .where("project_id", "=", projectId)
    .where("user_id", "=", userId)
    .execute();

  return true;
}

/**
 * Updates a project member's role
 *
 * @param projectId - The ID of the project
 * @param userId - The ID of the user
 * @param role - The new role
 * @returns The updated project member
 */
export async function updateProjectMemberRole(
  projectId: string,
  userId: string,
  role: string
) {
  return db
    .updateTable("project_members")
    .set({
      role,
      updated_at: new Date().toISOString(),
    })
    .where("project_id", "=", projectId)
    .where("user_id", "=", userId)
    .returningAll()
    .executeTakeFirstOrThrow();
}
