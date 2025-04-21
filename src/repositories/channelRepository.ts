import { db } from "../db/database";
import crypto from "crypto";
import { slugify } from "../utils/stringUtils";
import { isWorkspaceMember, getWorkspaceRole } from "./workspaceRepository";

/**
 * Interface for channel creation
 */
export interface CreateChannelInput {
  name: string;
  description?: string;
  isPrivate?: boolean;
  workspaceId: string;
  createdBy: string; // User ID
}

/**
 * Interface for channel update
 */
export interface UpdateChannelInput {
  name?: string;
  description?: string;
  isPrivate?: boolean;
}

/**
 * Creates a new channel
 * 
 * @param input - Channel creation input
 * @returns The created channel
 */
export async function createChannel(input: CreateChannelInput) {
  // Check if user is a member of the workspace
  const isMember = await isWorkspaceMember(input.workspaceId, input.createdBy);
  
  if (!isMember) {
    throw new Error("You must be a member of the workspace to create a channel");
  }
  
  // Generate a slug from the name
  let slug = slugify(input.name);
  
  // Check if slug already exists in this workspace
  const existingChannel = await db
    .selectFrom("channels")
    .select(["id"])
    .where("workspace_id", "=", input.workspaceId)
    .where("slug", "=", slug)
    .executeTakeFirst();
  
  // If slug exists, append a random string
  if (existingChannel) {
    slug = `${slug}-${crypto.randomBytes(3).toString('hex')}`;
  }
  
  // Create the channel
  const channel = await db
    .insertInto("channels")
    .values({
      id: crypto.randomUUID(),
      name: input.name,
      slug,
      description: input.description || null,
      is_private: input.isPrivate !== undefined ? input.isPrivate : false,
      workspace_id: input.workspaceId,
      created_by: input.createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  
  // Add the creator as a member
  await db
    .insertInto("channel_members")
    .values({
      id: crypto.randomUUID(),
      channel_id: channel.id,
      user_id: input.createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .execute();
  
  return channel;
}

/**
 * Gets a channel by ID
 * 
 * @param id - The ID of the channel
 * @returns The channel or null if not found
 */
export async function getChannelById(id: string) {
  return db
    .selectFrom("channels")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

/**
 * Gets a channel by slug and workspace ID
 * 
 * @param slug - The slug of the channel
 * @param workspaceId - The ID of the workspace
 * @returns The channel or null if not found
 */
export async function getChannelBySlug(slug: string, workspaceId: string) {
  return db
    .selectFrom("channels")
    .selectAll()
    .where("slug", "=", slug)
    .where("workspace_id", "=", workspaceId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

/**
 * Gets all channels in a workspace that a user has access to
 * 
 * @param workspaceId - The ID of the workspace
 * @param userId - The ID of the user
 * @returns Array of channels
 */
export async function getChannelsForUser(workspaceId: string, userId: string) {
  // Check if user is a member of the workspace
  const isMember = await isWorkspaceMember(workspaceId, userId);
  
  if (!isMember) {
    throw new Error("You must be a member of the workspace to view channels");
  }
  
  // Get workspace role
  const role = await getWorkspaceRole(workspaceId, userId);
  
  // If user is an admin, return all channels
  if (role === "admin") {
    return db
      .selectFrom("channels")
      .selectAll()
      .where("workspace_id", "=", workspaceId)
      .where("deleted_at", "is", null)
      .orderBy("created_at")
      .execute();
  }
  
  // Otherwise, return public channels and private channels the user is a member of
  return db
    .selectFrom("channels")
    .selectAll()
    .where("workspace_id", "=", workspaceId)
    .where("deleted_at", "is", null)
    .where(eb => eb.or([
      eb("is_private", "=", false),
      eb.exists(
        eb.selectFrom("channel_members")
          .select("id")
          .where("channel_id", "=", eb.ref("channels.id"))
          .where("user_id", "=", userId)
      )
    ]))
    .orderBy("created_at")
    .execute();
}

/**
 * Updates a channel
 * 
 * @param id - The ID of the channel
 * @param input - The fields to update
 * @param userId - The ID of the user making the update
 * @returns The updated channel
 */
export async function updateChannel(id: string, input: UpdateChannelInput, userId: string) {
  const channel = await getChannelById(id);
  
  if (!channel) {
    throw new Error(`Channel with ID '${id}' not found`);
  }
  
  // Check if user is a workspace admin or the channel creator
  const role = await getWorkspaceRole(channel.workspace_id, userId);
  const isCreator = channel.created_by === userId;
  
  if (role !== "admin" && !isCreator) {
    throw new Error("You don't have permission to update this channel");
  }
  
  // If name is changing, update the slug
  let slug = channel.slug;
  if (input.name && input.name !== channel.name) {
    slug = slugify(input.name);
    
    // Check if new slug already exists in this workspace
    const existingChannel = await db
      .selectFrom("channels")
      .select(["id"])
      .where("workspace_id", "=", channel.workspace_id)
      .where("slug", "=", slug)
      .where("id", "!=", id)
      .executeTakeFirst();
    
    // If slug exists, append a random string
    if (existingChannel) {
      slug = `${slug}-${crypto.randomBytes(3).toString('hex')}`;
    }
  }
  
  return db
    .updateTable("channels")
    .set({
      name: input.name !== undefined ? input.name : channel.name,
      slug: input.name !== undefined ? slug : channel.slug,
      description: input.description !== undefined ? input.description : channel.description,
      is_private: input.isPrivate !== undefined ? input.isPrivate : channel.is_private,
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Soft deletes a channel
 * 
 * @param id - The ID of the channel
 * @param userId - The ID of the user making the deletion
 * @returns True if successful
 */
export async function deleteChannel(id: string, userId: string) {
  const channel = await getChannelById(id);
  
  if (!channel) {
    throw new Error(`Channel with ID '${id}' not found`);
  }
  
  // Check if user is a workspace admin or the channel creator
  const role = await getWorkspaceRole(channel.workspace_id, userId);
  const isCreator = channel.created_by === userId;
  
  if (role !== "admin" && !isCreator) {
    throw new Error("You don't have permission to delete this channel");
  }
  
  await db
    .updateTable("channels")
    .set({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .execute();
  
  return true;
}

/**
 * Checks if a user is a member of a channel
 * 
 * @param channelId - The ID of the channel
 * @param userId - The ID of the user
 * @returns True if the user is a member
 */
export async function isChannelMember(channelId: string, userId: string) {
  const channel = await getChannelById(channelId);
  
  if (!channel) {
    return false;
  }
  
  // If channel is public, check if user is a workspace member
  if (!channel.is_private) {
    return isWorkspaceMember(channel.workspace_id, userId);
  }
  
  // If channel is private, check if user is a channel member
  const member = await db
    .selectFrom("channel_members")
    .select(["id"])
    .where("channel_id", "=", channelId)
    .where("user_id", "=", userId)
    .executeTakeFirst();
  
  return !!member;
}

/**
 * Gets all members of a channel
 * 
 * @param channelId - The ID of the channel
 * @returns Array of channel members with user details
 */
export async function getChannelMembers(channelId: string) {
  return db
    .selectFrom("channel_members")
    .innerJoin("users", "users.id", "channel_members.user_id")
    .select([
      "channel_members.id as membership_id",
      "channel_members.created_at as joined_at",
      "users.id as user_id",
      "users.username",
      "users.email",
      "users.first_name",
      "users.last_name",
      "users.avatar_url",
    ])
    .where("channel_members.channel_id", "=", channelId)
    .execute();
}

/**
 * Adds a member to a channel
 * 
 * @param channelId - The ID of the channel
 * @param userId - The ID of the user
 * @param addedBy - The ID of the user adding the member
 * @returns The created membership
 */
export async function addChannelMember(channelId: string, userId: string, addedBy: string) {
  const channel = await getChannelById(channelId);
  
  if (!channel) {
    throw new Error(`Channel with ID '${channelId}' not found`);
  }
  
  // Check if the user being added is a workspace member
  const isWorkspaceMem = await isWorkspaceMember(channel.workspace_id, userId);
  
  if (!isWorkspaceMem) {
    throw new Error("User must be a member of the workspace to join a channel");
  }
  
  // If channel is private, check if the user adding has permission
  if (channel.is_private) {
    // Check if user adding is a workspace admin, channel creator, or channel member
    const role = await getWorkspaceRole(channel.workspace_id, addedBy);
    const isCreator = channel.created_by === addedBy;
    const isChannelMem = await isChannelMember(channelId, addedBy);
    
    if (role !== "admin" && !isCreator && !isChannelMem) {
      throw new Error("You don't have permission to add members to this channel");
    }
  }
  
  // Check if already a member
  const existingMember = await db
    .selectFrom("channel_members")
    .select(["id"])
    .where("channel_id", "=", channelId)
    .where("user_id", "=", userId)
    .executeTakeFirst();
  
  if (existingMember) {
    throw new Error("User is already a member of this channel");
  }
  
  // Add the member
  return db
    .insertInto("channel_members")
    .values({
      id: crypto.randomUUID(),
      channel_id: channelId,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Removes a member from a channel
 * 
 * @param channelId - The ID of the channel
 * @param userId - The ID of the user
 * @param removedBy - The ID of the user removing the member
 * @returns True if successful
 */
export async function removeChannelMember(channelId: string, userId: string, removedBy: string) {
  const channel = await getChannelById(channelId);
  
  if (!channel) {
    throw new Error(`Channel with ID '${channelId}' not found`);
  }
  
  // If user is removing themselves, allow it
  if (userId === removedBy) {
    await db
      .deleteFrom("channel_members")
      .where("channel_id", "=", channelId)
      .where("user_id", "=", userId)
      .execute();
    
    return true;
  }
  
  // Otherwise, check if user has permission
  const role = await getWorkspaceRole(channel.workspace_id, removedBy);
  const isCreator = channel.created_by === removedBy;
  
  if (role !== "admin" && !isCreator) {
    throw new Error("You don't have permission to remove members from this channel");
  }
  
  await db
    .deleteFrom("channel_members")
    .where("channel_id", "=", channelId)
    .where("user_id", "=", userId)
    .execute();
  
  return true;
}
