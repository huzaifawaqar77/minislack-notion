import { db } from "../db/database";
import { sql } from "kysely";

/**
 * Gets dashboard statistics for a workspace
 *
 * @param workspaceId - The ID of the workspace
 * @param userId - The ID of the user requesting the stats
 * @returns Dashboard statistics
 */
export async function getWorkspaceDashboardStats(
  workspaceId: string,
  userId: string
) {
  // Set default date range (last month)
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - 1);

  // Format dates for SQL
  const startDateStr = startDate.toISOString();
  const endDateStr = endDate.toISOString();

  // Get total message count
  const totalMessages = await db
    .selectFrom("messages")
    .innerJoin("channels", "channels.id", "messages.channel_id")
    .select((eb) => eb.fn.count<number>("messages.id").as("count"))
    .where("channels.workspace_id", "=", workspaceId)
    .executeTakeFirst();

  // Get message count from last month
  const lastMonthMessages = await db
    .selectFrom("messages")
    .innerJoin("channels", "channels.id", "messages.channel_id")
    .select((eb) => eb.fn.count<number>("messages.id").as("count"))
    .where("channels.workspace_id", "=", workspaceId)
    .where("messages.created_at", ">=", startDateStr)
    .where("messages.created_at", "<=", endDateStr)
    .executeTakeFirst();

  // Get previous month message count for comparison
  const previousStartDate = new Date(startDate);
  previousStartDate.setMonth(previousStartDate.getMonth() - 1);
  const previousStartDateStr = previousStartDate.toISOString();

  const previousMonthMessages = await db
    .selectFrom("messages")
    .innerJoin("channels", "channels.id", "messages.channel_id")
    .select((eb) => eb.fn.count<number>("messages.id").as("count"))
    .where("channels.workspace_id", "=", workspaceId)
    .where("messages.created_at", ">=", previousStartDateStr)
    .where("messages.created_at", "<=", startDateStr)
    .executeTakeFirst();

  // Calculate message growth percentage
  const currentMonthCount = Number(lastMonthMessages?.count || 0);
  const previousMonthCount = Number(previousMonthMessages?.count || 0);
  const messageGrowth =
    previousMonthCount > 0
      ? ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100
      : 0;

  // Get active users count (users who sent messages in the last month)
  const activeUsers = await db
    .selectFrom("messages")
    .innerJoin("channels", "channels.id", "messages.channel_id")
    .select("messages.user_id")
    .distinct()
    .where("channels.workspace_id", "=", workspaceId)
    .where("messages.created_at", ">=", startDateStr)
    .where("messages.created_at", "<=", endDateStr)
    .execute();

  // Get previous month active users for comparison
  const previousMonthActiveUsers = await db
    .selectFrom("messages")
    .innerJoin("channels", "channels.id", "messages.channel_id")
    .select("messages.user_id")
    .distinct()
    .where("channels.workspace_id", "=", workspaceId)
    .where("messages.created_at", ">=", previousStartDateStr)
    .where("messages.created_at", "<=", startDateStr)
    .execute();

  // Calculate user growth percentage
  const currentActiveCount = activeUsers.length;
  const previousActiveCount = previousMonthActiveUsers.length;
  const userGrowth =
    previousActiveCount > 0
      ? ((currentActiveCount - previousActiveCount) / previousActiveCount) * 100
      : 0;

  // Get active channels count (channels with messages in the last month)
  const activeChannels = await db
    .selectFrom("messages")
    .innerJoin("channels", "channels.id", "messages.channel_id")
    .select("channels.id")
    .distinct()
    .where("channels.workspace_id", "=", workspaceId)
    .where("messages.created_at", ">=", startDateStr)
    .where("messages.created_at", "<=", endDateStr)
    .execute();

  // Get total channels count
  const totalChannels = await db
    .selectFrom("channels")
    .select((eb) => eb.fn.count<number>("id").as("count"))
    .where("workspace_id", "=", workspaceId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();

  // Get new channels created in the last month
  const newChannels = await db
    .selectFrom("channels")
    .select((eb) => eb.fn.count<number>("id").as("count"))
    .where("workspace_id", "=", workspaceId)
    .where("created_at", ">=", startDateStr)
    .where("created_at", "<=", endDateStr)
    .executeTakeFirst();

  // Get shared files count
  const totalFiles = await db
    .selectFrom("files")
    .select((eb) => eb.fn.count<number>("id").as("count"))
    .where("workspace_id", "=", workspaceId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();

  // Get files shared in the last week
  const lastWeekDate = new Date();
  lastWeekDate.setDate(lastWeekDate.getDate() - 7);
  const lastWeekDateStr = lastWeekDate.toISOString();

  const newFiles = await db
    .selectFrom("files")
    .select((eb) => eb.fn.count<number>("id").as("count"))
    .where("workspace_id", "=", workspaceId)
    .where("created_at", ">=", lastWeekDateStr)
    .where("created_at", "<=", endDateStr)
    .executeTakeFirst();

  // Get most active channels
  const topChannels = await db
    .selectFrom("messages")
    .innerJoin("channels", "channels.id", "messages.channel_id")
    .select([
      "channels.id as channel_id",
      "channels.name as channel_name",
      (eb) => eb.fn.count<number>("messages.id").as("message_count"),
    ])
    .where("channels.workspace_id", "=", workspaceId)
    .where("messages.created_at", ">=", startDateStr)
    .where("messages.created_at", "<=", endDateStr)
    .groupBy(["channels.id", "channels.name"])
    .orderBy("message_count", "desc")
    .limit(4)
    .execute();

  // Calculate percentages for top channels
  const totalMessagesInTopChannels = topChannels.reduce(
    (sum, channel) => sum + Number(channel.message_count),
    0
  );

  const topChannelsWithPercentage = topChannels.map((channel) => ({
    ...channel,
    percentage:
      totalMessagesInTopChannels > 0
        ? (Number(channel.message_count) / totalMessagesInTopChannels) * 100
        : 0,
  }));

  // Get activity data for the chart (messages per day for the last 30 days)
  const activityData = await db
    .selectFrom("messages")
    .innerJoin("channels", "channels.id", "messages.channel_id")
    .select([
      sql`DATE(messages.created_at)`.as("date"),
      sql`COUNT(messages.id)::integer`.as("count"),
    ])
    .where("channels.workspace_id", "=", workspaceId)
    .where("messages.created_at", ">=", startDateStr)
    .where("messages.created_at", "<=", endDateStr)
    .groupBy(sql`DATE(messages.created_at)`)
    .orderBy("date")
    .execute();

  return {
    totalMessages: Number(totalMessages?.count || 0),
    messageGrowth: parseFloat(messageGrowth.toFixed(1)),
    activeUsers: currentActiveCount,
    userGrowth: parseFloat(userGrowth.toFixed(1)),
    activeChannels: activeChannels.length,
    totalChannels: Number(totalChannels?.count || 0),
    newChannels: Number(newChannels?.count || 0),
    totalFiles: Number(totalFiles?.count || 0),
    newFiles: Number(newFiles?.count || 0),
    topChannels: topChannelsWithPercentage,
    activityData,
  };
}
