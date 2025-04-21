import { db } from "../db/database";
import crypto from "crypto";
import { isWorkspaceMember } from "./workspaceRepository";

/**
 * Interface for notification creation
 */
export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  workspaceId?: string;
  channelId?: string;
  messageId?: string;
  senderId?: string;
}

/**
 * Creates a new notification
 * 
 * @param input - Notification creation input
 * @returns The created notification
 */
export async function createNotification(input: CreateNotificationInput) {
  return db
    .insertInto("notifications")
    .values({
      id: crypto.randomUUID(),
      user_id: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data ? JSON.stringify(input.data) : null,
      workspace_id: input.workspaceId || null,
      channel_id: input.channelId || null,
      message_id: input.messageId || null,
      sender_id: input.senderId || null,
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Gets a notification by ID
 * 
 * @param id - The ID of the notification
 * @returns The notification or null if not found
 */
export async function getNotificationById(id: string) {
  return db
    .selectFrom("notifications")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}

/**
 * Gets all notifications for a user
 * 
 * @param userId - The ID of the user
 * @param limit - Maximum number of notifications to return
 * @param offset - Offset for pagination
 * @param unreadOnly - Whether to return only unread notifications
 * @returns Array of notifications
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 20,
  offset: number = 0,
  unreadOnly: boolean = false
) {
  let query = db
    .selectFrom("notifications")
    .leftJoin("users as sender", "sender.id", "notifications.sender_id")
    .select([
      "notifications.id",
      "notifications.type",
      "notifications.title",
      "notifications.message",
      "notifications.data",
      "notifications.workspace_id",
      "notifications.channel_id",
      "notifications.message_id",
      "notifications.is_read",
      "notifications.created_at",
      "sender.id as sender_id",
      "sender.username as sender_username",
      "sender.first_name as sender_first_name",
      "sender.last_name as sender_last_name",
      "sender.avatar_url as sender_avatar_url",
    ])
    .where("notifications.user_id", "=", userId);
  
  if (unreadOnly) {
    query = query.where("notifications.is_read", "=", false);
  }
  
  return query
    .orderBy("notifications.created_at", "desc")
    .limit(limit)
    .offset(offset)
    .execute();
}

/**
 * Gets the count of unread notifications for a user
 * 
 * @param userId - The ID of the user
 * @returns The count of unread notifications
 */
export async function getUnreadNotificationCount(userId: string) {
  const result = await db
    .selectFrom("notifications")
    .select(eb => eb.fn.count<number>("id").as("count"))
    .where("user_id", "=", userId)
    .where("is_read", "=", false)
    .executeTakeFirst();
  
  return parseInt(result?.count as any || "0");
}

/**
 * Marks a notification as read
 * 
 * @param id - The ID of the notification
 * @param userId - The ID of the user
 * @returns The updated notification
 */
export async function markNotificationAsRead(id: string, userId: string) {
  const notification = await getNotificationById(id);
  
  if (!notification) {
    throw new Error(`Notification with ID '${id}' not found`);
  }
  
  if (notification.user_id !== userId) {
    throw new Error("You don't have permission to update this notification");
  }
  
  return db
    .updateTable("notifications")
    .set({
      is_read: true,
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Marks all notifications as read for a user
 * 
 * @param userId - The ID of the user
 * @returns The number of notifications marked as read
 */
export async function markAllNotificationsAsRead(userId: string) {
  const result = await db
    .updateTable("notifications")
    .set({
      is_read: true,
      updated_at: new Date().toISOString(),
    })
    .where("user_id", "=", userId)
    .where("is_read", "=", false)
    .executeTakeFirst();
  
  return result;
}

/**
 * Deletes a notification
 * 
 * @param id - The ID of the notification
 * @param userId - The ID of the user
 * @returns True if successful
 */
export async function deleteNotification(id: string, userId: string) {
  const notification = await getNotificationById(id);
  
  if (!notification) {
    throw new Error(`Notification with ID '${id}' not found`);
  }
  
  if (notification.user_id !== userId) {
    throw new Error("You don't have permission to delete this notification");
  }
  
  await db
    .deleteFrom("notifications")
    .where("id", "=", id)
    .execute();
  
  return true;
}

/**
 * Creates a mention notification
 * 
 * @param mentionedUserId - The ID of the mentioned user
 * @param messageId - The ID of the message
 * @param channelId - The ID of the channel
 * @param workspaceId - The ID of the workspace
 * @param senderId - The ID of the sender
 * @param senderName - The name of the sender
 * @param channelName - The name of the channel
 * @returns The created notification
 */
export async function createMentionNotification(
  mentionedUserId: string,
  messageId: string,
  channelId: string,
  workspaceId: string,
  senderId: string,
  senderName: string,
  channelName: string,
  messagePreview: string
) {
  // Check if user is a member of the workspace
  const isMember = await isWorkspaceMember(workspaceId, mentionedUserId);
  
  if (!isMember) {
    throw new Error("User is not a member of this workspace");
  }
  
  return createNotification({
    userId: mentionedUserId,
    type: "mention",
    title: "New Mention",
    message: `${senderName} mentioned you in #${channelName}`,
    data: {
      messagePreview
    },
    workspaceId,
    channelId,
    messageId,
    senderId
  });
}

/**
 * Creates a channel invitation notification
 * 
 * @param invitedUserId - The ID of the invited user
 * @param channelId - The ID of the channel
 * @param workspaceId - The ID of the workspace
 * @param inviterId - The ID of the inviter
 * @param inviterName - The name of the inviter
 * @param channelName - The name of the channel
 * @returns The created notification
 */
export async function createChannelInviteNotification(
  invitedUserId: string,
  channelId: string,
  workspaceId: string,
  inviterId: string,
  inviterName: string,
  channelName: string
) {
  return createNotification({
    userId: invitedUserId,
    type: "channel_invite",
    title: "Channel Invitation",
    message: `${inviterName} added you to #${channelName}`,
    workspaceId,
    channelId,
    senderId: inviterId
  });
}

/**
 * Creates a workspace invitation notification
 * 
 * @param invitedUserId - The ID of the invited user
 * @param workspaceId - The ID of the workspace
 * @param inviterId - The ID of the inviter
 * @param inviterName - The name of the inviter
 * @param workspaceName - The name of the workspace
 * @returns The created notification
 */
export async function createWorkspaceInviteNotification(
  invitedUserId: string,
  workspaceId: string,
  inviterId: string,
  inviterName: string,
  workspaceName: string
) {
  return createNotification({
    userId: invitedUserId,
    type: "workspace_invite",
    title: "Workspace Invitation",
    message: `${inviterName} added you to ${workspaceName}`,
    workspaceId,
    senderId: inviterId
  });
}
