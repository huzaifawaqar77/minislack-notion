import { db } from "../db/database";
import { getWorkspaceRole } from "./workspaceRepository";

/**
 * Gets workspace activity statistics
 * 
 * @param workspaceId - The ID of the workspace
 * @param userId - The ID of the user requesting the statistics
 * @param startDate - Start date for the statistics (optional)
 * @param endDate - End date for the statistics (optional)
 * @returns Workspace activity statistics
 */
export async function getWorkspaceActivityStats(
  workspaceId: string,
  userId: string,
  startDate?: string,
  endDate?: string
) {
  // Check if user has permission to view workspace statistics
  const role = await getWorkspaceRole(workspaceId, userId);
  
  if (!role || (role !== "admin" && role !== "owner")) {
    throw new Error("You don't have permission to view workspace statistics");
  }
  
  // Set default date range if not provided
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end);
  start.setMonth(start.getMonth() - 1); // Default to 1 month ago
  
  // Format dates for SQL
  const startDateStr = start.toISOString();
  const endDateStr = end.toISOString();
  
  // Get message count
  const messageCount = await db
    .selectFrom("messages")
    .innerJoin("channels", "channels.id", "messages.channel_id")
    .select(eb => eb.fn.count<number>("messages.id").as("count"))
    .where("channels.workspace_id", "=", workspaceId)
    .where("messages.created_at", ">=", startDateStr)
    .where("messages.created_at", "<=", endDateStr)
    .executeTakeFirst();
  
  // Get active users count
  const activeUsers = await db
    .selectFrom("messages")
    .innerJoin("channels", "channels.id", "messages.channel_id")
    .select("messages.user_id")
    .distinct()
    .where("channels.workspace_id", "=", workspaceId)
    .where("messages.created_at", ">=", startDateStr)
    .where("messages.created_at", "<=", endDateStr)
    .execute();
  
  // Get file count
  const fileCount = await db
    .selectFrom("files")
    .select(eb => eb.fn.count<number>("id").as("count"))
    .where("workspace_id", "=", workspaceId)
    .where("created_at", ">=", startDateStr)
    .where("created_at", "<=", endDateStr)
    .executeTakeFirst();
  
  // Get channel count
  const channelCount = await db
    .selectFrom("channels")
    .select(eb => eb.fn.count<number>("id").as("count"))
    .where("workspace_id", "=", workspaceId)
    .where("created_at", ">=", startDateStr)
    .where("created_at", "<=", endDateStr)
    .executeTakeFirst();
  
  // Get total member count
  const memberCount = await db
    .selectFrom("workspace_members")
    .select(eb => eb.fn.count<number>("id").as("count"))
    .where("workspace_id", "=", workspaceId)
    .executeTakeFirst();
  
  // Get message activity by day
  const messagesByDay = await db
    .selectFrom("messages")
    .innerJoin("channels", "channels.id", "messages.channel_id")
    .select(eb => [
      eb.fn.date(eb.ref("messages.created_at")).as("date"),
      eb.fn.count<number>("messages.id").as("count")
    ])
    .where("channels.workspace_id", "=", workspaceId)
    .where("messages.created_at", ">=", startDateStr)
    .where("messages.created_at", "<=", endDateStr)
    .groupBy(eb => eb.fn.date(eb.ref("messages.created_at")))
    .orderBy("date")
    .execute();
  
  // Get most active channels
  const activeChannels = await db
    .selectFrom("messages")
    .innerJoin("channels", "channels.id", "messages.channel_id")
    .select([
      "channels.id as channel_id",
      "channels.name as channel_name",
      eb => eb.fn.count<number>("messages.id").as("message_count")
    ])
    .where("channels.workspace_id", "=", workspaceId)
    .where("messages.created_at", ">=", startDateStr)
    .where("messages.created_at", "<=", endDateStr)
    .groupBy(["channels.id", "channels.name"])
    .orderBy("message_count", "desc")
    .limit(5)
    .execute();
  
  // Get most active users
  const mostActiveUsers = await db
    .selectFrom("messages")
    .innerJoin("channels", "channels.id", "messages.channel_id")
    .innerJoin("users", "users.id", "messages.user_id")
    .select([
      "users.id as user_id",
      "users.username",
      "users.first_name",
      "users.last_name",
      eb => eb.fn.count<number>("messages.id").as("message_count")
    ])
    .where("channels.workspace_id", "=", workspaceId)
    .where("messages.created_at", ">=", startDateStr)
    .where("messages.created_at", "<=", endDateStr)
    .groupBy(["users.id", "users.username", "users.first_name", "users.last_name"])
    .orderBy("message_count", "desc")
    .limit(5)
    .execute();
  
  return {
    period: {
      start: startDateStr,
      end: endDateStr
    },
    overview: {
      messageCount: parseInt(messageCount?.count as any || "0"),
      activeUserCount: activeUsers.length,
      fileCount: parseInt(fileCount?.count as any || "0"),
      channelCount: parseInt(channelCount?.count as any || "0"),
      totalMemberCount: parseInt(memberCount?.count as any || "0")
    },
    messagesByDay,
    activeChannels,
    mostActiveUsers
  };
}

/**
 * Gets user activity statistics
 * 
 * @param userId - The ID of the user
 * @param requesterId - The ID of the user requesting the statistics
 * @param workspaceId - The ID of the workspace (optional)
 * @param startDate - Start date for the statistics (optional)
 * @param endDate - End date for the statistics (optional)
 * @returns User activity statistics
 */
export async function getUserActivityStats(
  userId: string,
  requesterId: string,
  workspaceId?: string,
  startDate?: string,
  endDate?: string
) {
  // Check if requester is the user or has admin permissions
  if (userId !== requesterId) {
    if (!workspaceId) {
      throw new Error("Workspace ID is required when requesting another user's statistics");
    }
    
    const role = await getWorkspaceRole(workspaceId, requesterId);
    
    if (!role || (role !== "admin" && role !== "owner")) {
      throw new Error("You don't have permission to view this user's statistics");
    }
  }
  
  // Set default date range if not provided
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end);
  start.setMonth(start.getMonth() - 1); // Default to 1 month ago
  
  // Format dates for SQL
  const startDateStr = start.toISOString();
  const endDateStr = end.toISOString();
  
  // Base query for messages
  let messagesQuery = db
    .selectFrom("messages")
    .innerJoin("channels", "channels.id", "messages.channel_id")
    .where("messages.user_id", "=", userId)
    .where("messages.created_at", ">=", startDateStr)
    .where("messages.created_at", "<=", endDateStr);
  
  // Add workspace filter if provided
  if (workspaceId) {
    messagesQuery = messagesQuery.where("channels.workspace_id", "=", workspaceId);
  }
  
  // Get message count
  const messageCount = await messagesQuery
    .select(eb => eb.fn.count<number>("messages.id").as("count"))
    .executeTakeFirst();
  
  // Base query for files
  let filesQuery = db
    .selectFrom("files")
    .where("uploaded_by", "=", userId)
    .where("created_at", ">=", startDateStr)
    .where("created_at", "<=", endDateStr);
  
  // Add workspace filter if provided
  if (workspaceId) {
    filesQuery = filesQuery.where("workspace_id", "=", workspaceId);
  }
  
  // Get file count
  const fileCount = await filesQuery
    .select(eb => eb.fn.count<number>("id").as("count"))
    .executeTakeFirst();
  
  // Get message activity by day
  let messagesByDayQuery = db
    .selectFrom("messages")
    .innerJoin("channels", "channels.id", "messages.channel_id")
    .select(eb => [
      eb.fn.date(eb.ref("messages.created_at")).as("date"),
      eb.fn.count<number>("messages.id").as("count")
    ])
    .where("messages.user_id", "=", userId)
    .where("messages.created_at", ">=", startDateStr)
    .where("messages.created_at", "<=", endDateStr);
  
  // Add workspace filter if provided
  if (workspaceId) {
    messagesByDayQuery = messagesByDayQuery.where("channels.workspace_id", "=", workspaceId);
  }
  
  const messagesByDay = await messagesByDayQuery
    .groupBy(eb => eb.fn.date(eb.ref("messages.created_at")))
    .orderBy("date")
    .execute();
  
  // Get most active channels
  let activeChannelsQuery = db
    .selectFrom("messages")
    .innerJoin("channels", "channels.id", "messages.channel_id")
    .select([
      "channels.id as channel_id",
      "channels.name as channel_name",
      eb => eb.fn.count<number>("messages.id").as("message_count")
    ])
    .where("messages.user_id", "=", userId)
    .where("messages.created_at", ">=", startDateStr)
    .where("messages.created_at", "<=", endDateStr);
  
  // Add workspace filter if provided
  if (workspaceId) {
    activeChannelsQuery = activeChannelsQuery.where("channels.workspace_id", "=", workspaceId);
  }
  
  const activeChannels = await activeChannelsQuery
    .groupBy(["channels.id", "channels.name"])
    .orderBy("message_count", "desc")
    .limit(5)
    .execute();
  
  return {
    period: {
      start: startDateStr,
      end: endDateStr
    },
    overview: {
      messageCount: parseInt(messageCount?.count as any || "0"),
      fileCount: parseInt(fileCount?.count as any || "0")
    },
    messagesByDay,
    activeChannels
  };
}

/**
 * Gets channel activity statistics
 * 
 * @param channelId - The ID of the channel
 * @param userId - The ID of the user requesting the statistics
 * @param startDate - Start date for the statistics (optional)
 * @param endDate - End date for the statistics (optional)
 * @returns Channel activity statistics
 */
export async function getChannelActivityStats(
  channelId: string,
  userId: string,
  startDate?: string,
  endDate?: string
) {
  // Get the channel to check workspace permissions
  const channel = await db
    .selectFrom("channels")
    .select(["workspace_id"])
    .where("id", "=", channelId)
    .executeTakeFirst();
  
  if (!channel) {
    throw new Error("Channel not found");
  }
  
  // Check if user has permission to view channel statistics
  const role = await getWorkspaceRole(channel.workspace_id, userId);
  
  if (!role || (role !== "admin" && role !== "owner" && role !== "moderator")) {
    throw new Error("You don't have permission to view channel statistics");
  }
  
  // Set default date range if not provided
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end);
  start.setMonth(start.getMonth() - 1); // Default to 1 month ago
  
  // Format dates for SQL
  const startDateStr = start.toISOString();
  const endDateStr = end.toISOString();
  
  // Get message count
  const messageCount = await db
    .selectFrom("messages")
    .select(eb => eb.fn.count<number>("id").as("count"))
    .where("channel_id", "=", channelId)
    .where("created_at", ">=", startDateStr)
    .where("created_at", "<=", endDateStr)
    .executeTakeFirst();
  
  // Get active users count
  const activeUsers = await db
    .selectFrom("messages")
    .select("user_id")
    .distinct()
    .where("channel_id", "=", channelId)
    .where("created_at", ">=", startDateStr)
    .where("created_at", "<=", endDateStr)
    .execute();
  
  // Get message activity by day
  const messagesByDay = await db
    .selectFrom("messages")
    .select(eb => [
      eb.fn.date(eb.ref("created_at")).as("date"),
      eb.fn.count<number>("id").as("count")
    ])
    .where("channel_id", "=", channelId)
    .where("created_at", ">=", startDateStr)
    .where("created_at", "<=", endDateStr)
    .groupBy(eb => eb.fn.date(eb.ref("created_at")))
    .orderBy("date")
    .execute();
  
  // Get most active users
  const mostActiveUsers = await db
    .selectFrom("messages")
    .innerJoin("users", "users.id", "messages.user_id")
    .select([
      "users.id as user_id",
      "users.username",
      "users.first_name",
      "users.last_name",
      eb => eb.fn.count<number>("messages.id").as("message_count")
    ])
    .where("messages.channel_id", "=", channelId)
    .where("messages.created_at", ">=", startDateStr)
    .where("messages.created_at", "<=", endDateStr)
    .groupBy(["users.id", "users.username", "users.first_name", "users.last_name"])
    .orderBy("message_count", "desc")
    .limit(5)
    .execute();
  
  // Get member count
  const memberCount = await db
    .selectFrom("channel_members")
    .select(eb => eb.fn.count<number>("id").as("count"))
    .where("channel_id", "=", channelId)
    .executeTakeFirst();
  
  return {
    period: {
      start: startDateStr,
      end: endDateStr
    },
    overview: {
      messageCount: parseInt(messageCount?.count as any || "0"),
      activeUserCount: activeUsers.length,
      totalMemberCount: parseInt(memberCount?.count as any || "0")
    },
    messagesByDay,
    mostActiveUsers
  };
}
