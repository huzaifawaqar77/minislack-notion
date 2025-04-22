import { db } from "../db/database";
import crypto from "crypto";
import { slugify } from "../utils/stringUtils";

/**
 * Interface for workspace creation
 */
export interface CreateWorkspaceInput {
  name: string;
  description?: string;
  iconUrl?: string;
  bannerUrl?: string;
  isPublic?: boolean;
  createdBy: string; // User ID
  organizationId?: string;
}

/**
 * Interface for workspace update
 */
export interface UpdateWorkspaceInput {
  name?: string;
  description?: string;
  iconUrl?: string;
  bannerUrl?: string;
  isPublic?: boolean;
}

/**
 * Creates a new workspace
 *
 * @param input - Workspace creation input
 * @returns The created workspace
 */
export async function createWorkspace(input: CreateWorkspaceInput) {
  // Generate a slug from the name
  let slug = slugify(input.name);

  // Check if slug already exists
  const existingWorkspace = await db
    .selectFrom("workspaces")
    .select(["id"])
    .where("slug", "=", slug)
    .executeTakeFirst();

  // If slug exists, append a random string
  if (existingWorkspace) {
    slug = `${slug}-${crypto.randomBytes(3).toString("hex")}`;
  }

  // Create the workspace
  const workspace = await db
    .insertInto("workspaces")
    .values({
      id: crypto.randomUUID(),
      name: input.name,
      slug,
      description: input.description || null,
      icon_url: input.iconUrl || null,
      banner_url: input.bannerUrl || null,
      is_public: input.isPublic !== undefined ? input.isPublic : false,
      created_by: input.createdBy,
      organization_id: input.organizationId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  // Add the creator as a member with admin role
  await db
    .insertInto("workspace_members")
    .values({
      id: crypto.randomUUID(),
      workspace_id: workspace.id,
      user_id: input.createdBy,
      role: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .execute();

  return workspace;
}

/**
 * Gets a workspace by ID
 *
 * @param id - The ID of the workspace
 * @returns The workspace or null if not found
 */
export async function getWorkspaceById(id: string) {
  return db
    .selectFrom("workspaces")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

/**
 * Gets a workspace by slug
 *
 * @param slug - The slug of the workspace
 * @returns The workspace or null if not found
 */
export async function getWorkspaceBySlug(slug: string) {
  return db
    .selectFrom("workspaces")
    .selectAll()
    .where("slug", "=", slug)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

/**
 * Gets all workspaces for a user
 *
 * @param userId - The ID of the user
 * @param organizationId - Optional organization ID to filter by
 * @returns Array of workspaces
 */
export async function getWorkspacesForUser(
  userId: string,
  organizationId?: string
) {
  let query = db
    .selectFrom("workspaces")
    .innerJoin(
      "workspace_members",
      "workspace_members.workspace_id",
      "workspaces.id"
    )
    .selectAll("workspaces")
    .where("workspace_members.user_id", "=", userId)
    .where("workspaces.deleted_at", "is", null);

  // Filter by organization if provided
  if (organizationId) {
    query = query.where("workspaces.organization_id", "=", organizationId);
  }

  return query.execute();
}

/**
 * Updates a workspace
 *
 * @param id - The ID of the workspace
 * @param input - The fields to update
 * @returns The updated workspace
 */
export async function updateWorkspace(id: string, input: UpdateWorkspaceInput) {
  const workspace = await getWorkspaceById(id);

  if (!workspace) {
    throw new Error(`Workspace with ID '${id}' not found`);
  }

  // If name is changing, update the slug
  let slug = workspace.slug;
  if (input.name && input.name !== workspace.name) {
    slug = slugify(input.name);

    // Check if new slug already exists
    const existingWorkspace = await db
      .selectFrom("workspaces")
      .select(["id"])
      .where("slug", "=", slug)
      .where("id", "!=", id)
      .executeTakeFirst();

    // If slug exists, append a random string
    if (existingWorkspace) {
      slug = `${slug}-${crypto.randomBytes(3).toString("hex")}`;
    }
  }

  return db
    .updateTable("workspaces")
    .set({
      name: input.name !== undefined ? input.name : workspace.name,
      slug: input.name !== undefined ? slug : workspace.slug,
      description:
        input.description !== undefined
          ? input.description
          : workspace.description,
      icon_url:
        input.iconUrl !== undefined ? input.iconUrl : workspace.icon_url,
      banner_url:
        input.bannerUrl !== undefined ? input.bannerUrl : workspace.banner_url,
      is_public:
        input.isPublic !== undefined ? input.isPublic : workspace.is_public,
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Soft deletes a workspace
 *
 * @param id - The ID of the workspace
 * @returns True if successful
 */
export async function deleteWorkspace(id: string) {
  const workspace = await getWorkspaceById(id);

  if (!workspace) {
    throw new Error(`Workspace with ID '${id}' not found`);
  }

  await db
    .updateTable("workspaces")
    .set({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .execute();

  return true;
}

/**
 * Checks if a user is a member of a workspace
 *
 * @param workspaceId - The ID of the workspace
 * @param userId - The ID of the user
 * @returns True if the user is a member
 */
export async function isWorkspaceMember(workspaceId: string, userId: string) {
  const member = await db
    .selectFrom("workspace_members")
    .select(["id"])
    .where("workspace_id", "=", workspaceId)
    .where("user_id", "=", userId)
    .executeTakeFirst();

  return !!member;
}

/**
 * Gets a user's role in a workspace
 *
 * @param workspaceId - The ID of the workspace
 * @param userId - The ID of the user
 * @returns The user's role or null if not a member
 */
export async function getWorkspaceRole(workspaceId: string, userId: string) {
  const member = await db
    .selectFrom("workspace_members")
    .select(["role"])
    .where("workspace_id", "=", workspaceId)
    .where("user_id", "=", userId)
    .executeTakeFirst();

  return member ? member.role : null;
}

/**
 * Gets all members of a workspace
 *
 * @param workspaceId - The ID of the workspace
 * @returns Array of workspace members with user details
 */
export async function getWorkspaceMembers(workspaceId: string) {
  return db
    .selectFrom("workspace_members")
    .innerJoin("users", "users.id", "workspace_members.user_id")
    .select([
      "workspace_members.id as membership_id",
      "workspace_members.role",
      "workspace_members.created_at as joined_at",
      "users.id as user_id",
      "users.username",
      "users.email",
      "users.first_name",
      "users.last_name",
      "users.avatar_url",
      "users.status",
      "users.last_active",
    ])
    .where("workspace_members.workspace_id", "=", workspaceId)
    .execute();
}

/**
 * Adds a member to a workspace
 *
 * @param workspaceId - The ID of the workspace
 * @param userId - The ID of the user
 * @param role - The role to assign
 * @returns The created membership
 */
export async function addWorkspaceMember(
  workspaceId: string,
  userId: string,
  role: string = "member"
) {
  // Check if already a member
  const existingMember = await db
    .selectFrom("workspace_members")
    .select(["id"])
    .where("workspace_id", "=", workspaceId)
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (existingMember) {
    throw new Error("User is already a member of this workspace");
  }

  // Add the member
  return db
    .insertInto("workspace_members")
    .values({
      id: crypto.randomUUID(),
      workspace_id: workspaceId,
      user_id: userId,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Removes a member from a workspace
 *
 * @param workspaceId - The ID of the workspace
 * @param userId - The ID of the user
 * @returns True if successful
 */
export async function removeWorkspaceMember(
  workspaceId: string,
  userId: string
) {
  await db
    .deleteFrom("workspace_members")
    .where("workspace_id", "=", workspaceId)
    .where("user_id", "=", userId)
    .execute();

  return true;
}

/**
 * Updates a member's role in a workspace
 *
 * @param workspaceId - The ID of the workspace
 * @param userId - The ID of the user
 * @param role - The new role
 * @returns The updated membership
 */
export async function updateWorkspaceMemberRole(
  workspaceId: string,
  userId: string,
  role: string
) {
  return db
    .updateTable("workspace_members")
    .set({
      role,
      updated_at: new Date().toISOString(),
    })
    .where("workspace_id", "=", workspaceId)
    .where("user_id", "=", userId)
    .returningAll()
    .executeTakeFirstOrThrow();
}
