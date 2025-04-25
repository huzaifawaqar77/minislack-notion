import { getIO } from "../index";
import * as notificationRepository from "../repositories/notificationRepository";
import { isWorkspaceMember } from "../repositories/workspaceRepository";
import { Server as SocketIOServer } from "socket.io";

/**
 * Notification types
 */
export enum NotificationType {
  MENTION = "mention",
  CHANNEL_MESSAGE = "channel_message",
  DIRECT_MESSAGE = "direct_message",
  WORKSPACE_INVITATION = "workspace_invitation",
  CHANNEL_INVITATION = "channel_invitation",
  NEW_CHANNEL = "new_channel",
  FILE_SHARED = "file_shared",
  REACTION = "reaction",
  REPLY = "reply",
  SYSTEM = "system",
}

/**
 * Creates a notification and sends it via WebSocket
 * 
 * @param input - Notification creation input
 * @returns The created notification
 */
export async function createAndSendNotification(
  input: notificationRepository.CreateNotificationInput
) {
  try {
    // Create the notification in the database
    const notification = await notificationRepository.createNotification(input);
    
    // Get the Socket.IO instance
    const io = getIO();
    
    // Send the notification to the user via WebSocket
    sendNotificationToUser(io, input.userId, notification);
    
    // If the notification is related to a workspace, also send a workspace notification
    if (input.workspaceId) {
      // Check if the user is a member of the workspace
      const isMember = await isWorkspaceMember(input.workspaceId, input.userId);
      
      if (isMember) {
        // Send a notification to the workspace room
        io.to(`workspace:${input.workspaceId}`).emit("workspace:notification", {
          workspaceId: input.workspaceId,
          notification: {
            ...notification,
            // Don't include sensitive data in the broadcast
            data: input.data ? JSON.stringify(input.data) : null,
          },
        });
      }
    }
    
    return notification;
  } catch (error) {
    console.error("Error creating and sending notification:", error);
    throw error;
  }
}

/**
 * Sends a notification to a specific user via WebSocket
 * 
 * @param io - Socket.IO server instance
 * @param userId - The ID of the user to send the notification to
 * @param notification - The notification to send
 */
export function sendNotificationToUser(
  io: SocketIOServer,
  userId: string,
  notification: any
) {
  // Emit to the user's room
  io.to(`user:${userId}`).emit("notification", notification);
  
  // Also emit an unread count update
  updateUnreadCount(io, userId);
}

/**
 * Updates the unread notification count for a user
 * 
 * @param io - Socket.IO server instance
 * @param userId - The ID of the user
 */
export async function updateUnreadCount(io: SocketIOServer, userId: string) {
  try {
    // Get the unread count from the database
    const count = await notificationRepository.getUnreadNotificationCount(userId);
    
    // Send the count to the user
    io.to(`user:${userId}`).emit("notification:unread_count", { count });
  } catch (error) {
    console.error("Error updating unread notification count:", error);
  }
}

/**
 * Creates a mention notification
 * 
 * @param userId - The ID of the user being mentioned
 * @param senderId - The ID of the user who mentioned them
 * @param workspaceId - The ID of the workspace
 * @param channelId - The ID of the channel
 * @param messageId - The ID of the message
 * @param messageContent - The content of the message
 */
export async function createMentionNotification(
  userId: string,
  senderId: string,
  workspaceId: string,
  channelId: string,
  messageId: string,
  messageContent: string
) {
  return createAndSendNotification({
    userId,
    type: NotificationType.MENTION,
    title: "New mention",
    message: `You were mentioned in a message`,
    data: {
      messageContent: messageContent.substring(0, 100) + (messageContent.length > 100 ? "..." : ""),
    },
    workspaceId,
    channelId,
    messageId,
    senderId,
  });
}

/**
 * Creates a direct message notification
 * 
 * @param userId - The ID of the user receiving the DM
 * @param senderId - The ID of the user sending the DM
 * @param messageId - The ID of the message
 * @param messageContent - The content of the message
 */
export async function createDirectMessageNotification(
  userId: string,
  senderId: string,
  messageId: string,
  messageContent: string
) {
  return createAndSendNotification({
    userId,
    type: NotificationType.DIRECT_MESSAGE,
    title: "New direct message",
    message: `You received a new direct message`,
    data: {
      messageContent: messageContent.substring(0, 100) + (messageContent.length > 100 ? "..." : ""),
    },
    messageId,
    senderId,
  });
}

/**
 * Creates a workspace invitation notification
 * 
 * @param userId - The ID of the user being invited
 * @param senderId - The ID of the user sending the invitation
 * @param workspaceId - The ID of the workspace
 * @param workspaceName - The name of the workspace
 */
export async function createWorkspaceInvitationNotification(
  userId: string,
  senderId: string,
  workspaceId: string,
  workspaceName: string
) {
  return createAndSendNotification({
    userId,
    type: NotificationType.WORKSPACE_INVITATION,
    title: "Workspace invitation",
    message: `You've been invited to join ${workspaceName}`,
    data: {
      workspaceName,
    },
    workspaceId,
    senderId,
  });
}

/**
 * Creates a channel invitation notification
 * 
 * @param userId - The ID of the user being invited
 * @param senderId - The ID of the user sending the invitation
 * @param workspaceId - The ID of the workspace
 * @param channelId - The ID of the channel
 * @param channelName - The name of the channel
 */
export async function createChannelInvitationNotification(
  userId: string,
  senderId: string,
  workspaceId: string,
  channelId: string,
  channelName: string
) {
  return createAndSendNotification({
    userId,
    type: NotificationType.CHANNEL_INVITATION,
    title: "Channel invitation",
    message: `You've been invited to join #${channelName}`,
    data: {
      channelName,
    },
    workspaceId,
    channelId,
    senderId,
  });
}

/**
 * Creates a new channel notification
 * 
 * @param userId - The ID of the user to notify
 * @param senderId - The ID of the user who created the channel
 * @param workspaceId - The ID of the workspace
 * @param channelId - The ID of the channel
 * @param channelName - The name of the channel
 */
export async function createNewChannelNotification(
  userId: string,
  senderId: string,
  workspaceId: string,
  channelId: string,
  channelName: string
) {
  return createAndSendNotification({
    userId,
    type: NotificationType.NEW_CHANNEL,
    title: "New channel created",
    message: `A new channel #${channelName} has been created`,
    data: {
      channelName,
    },
    workspaceId,
    channelId,
    senderId,
  });
}

/**
 * Creates a file shared notification
 * 
 * @param userId - The ID of the user to notify
 * @param senderId - The ID of the user who shared the file
 * @param workspaceId - The ID of the workspace
 * @param channelId - The ID of the channel
 * @param messageId - The ID of the message
 * @param fileName - The name of the file
 */
export async function createFileSharedNotification(
  userId: string,
  senderId: string,
  workspaceId: string,
  channelId: string,
  messageId: string,
  fileName: string
) {
  return createAndSendNotification({
    userId,
    type: NotificationType.FILE_SHARED,
    title: "File shared",
    message: `A file has been shared with you`,
    data: {
      fileName,
    },
    workspaceId,
    channelId,
    messageId,
    senderId,
  });
}

/**
 * Creates a reaction notification
 * 
 * @param userId - The ID of the user to notify
 * @param senderId - The ID of the user who reacted
 * @param workspaceId - The ID of the workspace
 * @param channelId - The ID of the channel
 * @param messageId - The ID of the message
 * @param reaction - The reaction emoji
 */
export async function createReactionNotification(
  userId: string,
  senderId: string,
  workspaceId: string,
  channelId: string,
  messageId: string,
  reaction: string
) {
  return createAndSendNotification({
    userId,
    type: NotificationType.REACTION,
    title: "New reaction",
    message: `Someone reacted to your message`,
    data: {
      reaction,
    },
    workspaceId,
    channelId,
    messageId,
    senderId,
  });
}

/**
 * Creates a reply notification
 * 
 * @param userId - The ID of the user to notify
 * @param senderId - The ID of the user who replied
 * @param workspaceId - The ID of the workspace
 * @param channelId - The ID of the channel
 * @param messageId - The ID of the message
 * @param replyContent - The content of the reply
 */
export async function createReplyNotification(
  userId: string,
  senderId: string,
  workspaceId: string,
  channelId: string,
  messageId: string,
  replyContent: string
) {
  return createAndSendNotification({
    userId,
    type: NotificationType.REPLY,
    title: "New reply",
    message: `Someone replied to your message`,
    data: {
      replyContent: replyContent.substring(0, 100) + (replyContent.length > 100 ? "..." : ""),
    },
    workspaceId,
    channelId,
    messageId,
    senderId,
  });
}

/**
 * Creates a system notification
 * 
 * @param userId - The ID of the user to notify
 * @param title - The title of the notification
 * @param message - The message of the notification
 * @param data - Additional data for the notification
 */
export async function createSystemNotification(
  userId: string,
  title: string,
  message: string,
  data?: any
) {
  return createAndSendNotification({
    userId,
    type: NotificationType.SYSTEM,
    title,
    message,
    data,
  });
}
