import { db } from "../db/database";
import { getWorkspaceRole } from "../repositories/workspaceRepository";
import { isChannelMember } from "../repositories/channelRepository";

/**
 * Permission levels
 */
export enum PermissionLevel {
  NONE = 0,
  READ = 1,
  WRITE = 2,
  MANAGE = 3,
  ADMIN = 4,
  OWNER = 5
}

/**
 * Resource types
 */
export enum ResourceType {
  WORKSPACE = 'workspace',
  CHANNEL = 'channel',
  MESSAGE = 'message',
  FILE = 'file',
  USER = 'user'
}

/**
 * Permission actions
 */
export enum PermissionAction {
  VIEW = 'view',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
  INVITE = 'invite',
  MANAGE_MEMBERS = 'manage_members',
  MANAGE_ROLES = 'manage_roles',
  MANAGE_SETTINGS = 'manage_settings'
}

/**
 * Role definitions with permission levels
 */
const rolePermissions: Record<string, Record<ResourceType, PermissionLevel>> = {
  owner: {
    [ResourceType.WORKSPACE]: PermissionLevel.OWNER,
    [ResourceType.CHANNEL]: PermissionLevel.OWNER,
    [ResourceType.MESSAGE]: PermissionLevel.OWNER,
    [ResourceType.FILE]: PermissionLevel.OWNER,
    [ResourceType.USER]: PermissionLevel.OWNER
  },
  admin: {
    [ResourceType.WORKSPACE]: PermissionLevel.ADMIN,
    [ResourceType.CHANNEL]: PermissionLevel.ADMIN,
    [ResourceType.MESSAGE]: PermissionLevel.ADMIN,
    [ResourceType.FILE]: PermissionLevel.ADMIN,
    [ResourceType.USER]: PermissionLevel.ADMIN
  },
  moderator: {
    [ResourceType.WORKSPACE]: PermissionLevel.MANAGE,
    [ResourceType.CHANNEL]: PermissionLevel.MANAGE,
    [ResourceType.MESSAGE]: PermissionLevel.MANAGE,
    [ResourceType.FILE]: PermissionLevel.MANAGE,
    [ResourceType.USER]: PermissionLevel.READ
  },
  member: {
    [ResourceType.WORKSPACE]: PermissionLevel.READ,
    [ResourceType.CHANNEL]: PermissionLevel.WRITE,
    [ResourceType.MESSAGE]: PermissionLevel.WRITE,
    [ResourceType.FILE]: PermissionLevel.WRITE,
    [ResourceType.USER]: PermissionLevel.READ
  },
  guest: {
    [ResourceType.WORKSPACE]: PermissionLevel.READ,
    [ResourceType.CHANNEL]: PermissionLevel.READ,
    [ResourceType.MESSAGE]: PermissionLevel.READ,
    [ResourceType.FILE]: PermissionLevel.READ,
    [ResourceType.USER]: PermissionLevel.READ
  }
};

/**
 * Action permission level requirements
 */
const actionPermissionLevels: Record<PermissionAction, PermissionLevel> = {
  [PermissionAction.VIEW]: PermissionLevel.READ,
  [PermissionAction.CREATE]: PermissionLevel.WRITE,
  [PermissionAction.EDIT]: PermissionLevel.WRITE,
  [PermissionAction.DELETE]: PermissionLevel.WRITE,
  [PermissionAction.INVITE]: PermissionLevel.MANAGE,
  [PermissionAction.MANAGE_MEMBERS]: PermissionLevel.MANAGE,
  [PermissionAction.MANAGE_ROLES]: PermissionLevel.ADMIN,
  [PermissionAction.MANAGE_SETTINGS]: PermissionLevel.ADMIN
};

/**
 * Checks if a user has permission to perform an action on a resource
 * 
 * @param userId - The ID of the user
 * @param resourceType - The type of resource
 * @param resourceId - The ID of the resource
 * @param action - The action to perform
 * @returns Promise resolving to true if the user has permission
 */
export async function hasPermission(
  userId: string,
  resourceType: ResourceType,
  resourceId: string,
  action: PermissionAction
): Promise<boolean> {
  // Get the required permission level for the action
  const requiredLevel = actionPermissionLevels[action];
  
  // Get the user's permission level for the resource
  const userLevel = await getUserPermissionLevel(userId, resourceType, resourceId);
  
  // Check if the user has sufficient permission
  return userLevel >= requiredLevel;
}

/**
 * Gets a user's permission level for a resource
 * 
 * @param userId - The ID of the user
 * @param resourceType - The type of resource
 * @param resourceId - The ID of the resource
 * @returns Promise resolving to the user's permission level
 */
export async function getUserPermissionLevel(
  userId: string,
  resourceType: ResourceType,
  resourceId: string
): Promise<PermissionLevel> {
  switch (resourceType) {
    case ResourceType.WORKSPACE:
      return getWorkspacePermissionLevel(userId, resourceId);
    
    case ResourceType.CHANNEL:
      return getChannelPermissionLevel(userId, resourceId);
    
    case ResourceType.MESSAGE:
      return getMessagePermissionLevel(userId, resourceId);
    
    case ResourceType.FILE:
      return getFilePermissionLevel(userId, resourceId);
    
    case ResourceType.USER:
      return getUserUserPermissionLevel(userId, resourceId);
    
    default:
      return PermissionLevel.NONE;
  }
}

/**
 * Gets a user's permission level for a workspace
 * 
 * @param userId - The ID of the user
 * @param workspaceId - The ID of the workspace
 * @returns Promise resolving to the user's permission level
 */
async function getWorkspacePermissionLevel(userId: string, workspaceId: string): Promise<PermissionLevel> {
  // Get the user's role in the workspace
  const role = await getWorkspaceRole(workspaceId, userId);
  
  if (!role) {
    return PermissionLevel.NONE;
  }
  
  // Check if the user is the workspace creator
  const workspace = await db
    .selectFrom("workspaces")
    .select(["created_by"])
    .where("id", "=", workspaceId)
    .executeTakeFirst();
  
  if (workspace?.created_by === userId) {
    return PermissionLevel.OWNER;
  }
  
  // Return the permission level based on the role
  return rolePermissions[role]?.[ResourceType.WORKSPACE] || PermissionLevel.NONE;
}

/**
 * Gets a user's permission level for a channel
 * 
 * @param userId - The ID of the user
 * @param channelId - The ID of the channel
 * @returns Promise resolving to the user's permission level
 */
async function getChannelPermissionLevel(userId: string, channelId: string): Promise<PermissionLevel> {
  // Get the channel
  const channel = await db
    .selectFrom("channels")
    .select(["workspace_id", "created_by", "is_private"])
    .where("id", "=", channelId)
    .executeTakeFirst();
  
  if (!channel) {
    return PermissionLevel.NONE;
  }
  
  // Check if the user is the channel creator
  if (channel.created_by === userId) {
    return PermissionLevel.OWNER;
  }
  
  // Get the user's workspace role
  const workspaceRole = await getWorkspaceRole(channel.workspace_id, userId);
  
  if (!workspaceRole) {
    return PermissionLevel.NONE;
  }
  
  // If the user is a workspace admin or owner, they have admin access to all channels
  if (workspaceRole === 'admin' || workspaceRole === 'owner') {
    return rolePermissions[workspaceRole][ResourceType.CHANNEL];
  }
  
  // If the channel is private, check if the user is a member
  if (channel.is_private) {
    const isMember = await isChannelMember(channelId, userId);
    
    if (!isMember) {
      return PermissionLevel.NONE;
    }
  }
  
  // Return the permission level based on the workspace role
  return rolePermissions[workspaceRole][ResourceType.CHANNEL];
}

/**
 * Gets a user's permission level for a message
 * 
 * @param userId - The ID of the user
 * @param messageId - The ID of the message
 * @returns Promise resolving to the user's permission level
 */
async function getMessagePermissionLevel(userId: string, messageId: string): Promise<PermissionLevel> {
  // Get the message
  const message = await db
    .selectFrom("messages")
    .select(["channel_id", "user_id"])
    .where("id", "=", messageId)
    .executeTakeFirst();
  
  if (!message) {
    return PermissionLevel.NONE;
  }
  
  // Check if the user is the message author
  if (message.user_id === userId) {
    return PermissionLevel.OWNER;
  }
  
  // Get the user's channel permission level
  return getChannelPermissionLevel(userId, message.channel_id);
}

/**
 * Gets a user's permission level for a file
 * 
 * @param userId - The ID of the user
 * @param fileId - The ID of the file
 * @returns Promise resolving to the user's permission level
 */
async function getFilePermissionLevel(userId: string, fileId: string): Promise<PermissionLevel> {
  // Get the file
  const file = await db
    .selectFrom("files")
    .select(["workspace_id", "uploaded_by", "is_public"])
    .where("id", "=", fileId)
    .executeTakeFirst();
  
  if (!file) {
    return PermissionLevel.NONE;
  }
  
  // Check if the user is the file uploader
  if (file.uploaded_by === userId) {
    return PermissionLevel.OWNER;
  }
  
  // Get the user's workspace role
  const workspaceRole = await getWorkspaceRole(file.workspace_id, userId);
  
  if (!workspaceRole) {
    return PermissionLevel.NONE;
  }
  
  // If the user is a workspace admin or owner, they have admin access to all files
  if (workspaceRole === 'admin' || workspaceRole === 'owner') {
    return rolePermissions[workspaceRole][ResourceType.FILE];
  }
  
  // Return the permission level based on the workspace role
  return rolePermissions[workspaceRole][ResourceType.FILE];
}

/**
 * Gets a user's permission level for another user
 * 
 * @param userId - The ID of the user
 * @param targetUserId - The ID of the target user
 * @returns Promise resolving to the user's permission level
 */
async function getUserUserPermissionLevel(userId: string, targetUserId: string): Promise<PermissionLevel> {
  // If the user is checking permissions for themselves, they have owner access
  if (userId === targetUserId) {
    return PermissionLevel.OWNER;
  }
  
  // Find workspaces where both users are members
  const sharedWorkspaces = await db
    .selectFrom("workspace_members as wm1")
    .innerJoin("workspace_members as wm2", join => 
      join.onRef("wm1.workspace_id", "=", "wm2.workspace_id")
    )
    .select(["wm1.workspace_id", "wm1.role as user_role"])
    .where("wm1.user_id", "=", userId)
    .where("wm2.user_id", "=", targetUserId)
    .execute();
  
  if (sharedWorkspaces.length === 0) {
    return PermissionLevel.NONE;
  }
  
  // Find the highest permission level across all shared workspaces
  let highestLevel = PermissionLevel.NONE;
  
  for (const workspace of sharedWorkspaces) {
    const level = rolePermissions[workspace.user_role]?.[ResourceType.USER] || PermissionLevel.NONE;
    
    if (level > highestLevel) {
      highestLevel = level;
    }
  }
  
  return highestLevel;
}
