import crypto from "crypto";
import { db } from "../db/database";
import { sql } from "kysely";

/**
 * Creates a new DM channel or returns an existing one
 *
 * @param currentUserId - The ID of the current user
 * @param otherUserId - The ID of the other user
 * @returns The DM channel
 */
export async function createOrGetDMChannel(
  currentUserId: string,
  otherUserId: string
) {
  // Check if both users exist
  const users = await db
    .selectFrom("users")
    .select(["id", "username", "first_name", "last_name", "avatar_url"])
    .where("id", "in", [currentUserId, otherUserId])
    .execute();

  if (users.length !== 2) {
    throw new Error("One or both users do not exist");
  }

  // Check if a DM channel already exists between these users
  const existingChannel = await db
    .selectFrom("channels as c")
    .innerJoin("channel_members as cm1", "c.id", "cm1.channel_id")
    .innerJoin("channel_members as cm2", "c.id", "cm2.channel_id")
    .select(["c.id", "c.name", "c.created_at", "c.updated_at"])
    .where("c.is_direct", "=", true)
    .where("cm1.user_id", "=", currentUserId)
    .where("cm2.user_id", "=", otherUserId)
    .executeTakeFirst();

  if (existingChannel) {
    // Get the other user's details
    const otherUser = users.find((user) => user.id === otherUserId);

    return {
      ...existingChannel,
      other_user: otherUser,
    };
  }

  // Create a new DM channel
  const channelId = crypto.randomUUID();

  // Generate a name for the channel (not displayed to users)
  const channelName = `dm-${currentUserId.substring(0, 8)}-${otherUserId.substring(0, 8)}`;

  // Create the channel
  await db
    .insertInto("channels")
    .values({
      id: channelId,
      name: channelName,
      is_direct: true,
      is_private: true,
      created_by: currentUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .execute();

  // Add both users as members
  await db
    .insertInto("channel_members")
    .values([
      {
        id: crypto.randomUUID(),
        channel_id: channelId,
        user_id: currentUserId,
        role: "member",
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        channel_id: channelId,
        user_id: otherUserId,
        role: "member",
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .execute();

  // Get the other user's details
  const otherUser = users.find((user) => user.id === otherUserId);

  return {
    id: channelId,
    name: channelName,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    other_user: otherUser,
  };
}

/**
 * Gets all DM channels for a user
 *
 * @param userId - The ID of the user
 * @returns The DM channels
 */
export async function getUserDMChannels(userId: string) {
  // Get all DM channels where the user is a member
  const channels = await db
    .selectFrom("channels as c")
    .innerJoin("channel_members as cm", "c.id", "cm.channel_id")
    .select(["c.id", "c.name", "c.created_at", "c.updated_at"])
    .where("c.is_direct", "=", true)
    .where("cm.user_id", "=", userId)
    .execute();

  // For each channel, get the other user's details
  const channelsWithUsers = await Promise.all(
    channels.map(async (channel) => {
      // Get the other user in this DM channel
      const otherMember = await db
        .selectFrom("channel_members as cm")
        .innerJoin("users as u", "cm.user_id", "u.id")
        .select([
          "u.id",
          "u.username",
          "u.first_name",
          "u.last_name",
          "u.avatar_url",
        ])
        .where("cm.channel_id", "=", channel.id)
        .where("cm.user_id", "!=", userId)
        .executeTakeFirst();

      // Get the last message in this channel
      const lastMessage = await db
        .selectFrom("messages")
        .select(["id", "content", "created_at", "user_id"])
        .where("channel_id", "=", channel.id)
        .orderBy("created_at", "desc")
        .limit(1)
        .executeTakeFirst();

      // Get the last read message ID for this user in this channel
      const memberInfo = await db
        .selectFrom("channel_members")
        .select(["last_read_message_id"])
        .where("channel_id", "=", channel.id)
        .where("user_id", "=", userId)
        .executeTakeFirst();

      // Get unread message count - only count messages from other users that are newer than the last read message
      let unreadCount;
      if (memberInfo?.last_read_message_id) {
        // If we have a last read message ID, count messages newer than that
        const lastReadMessage = await db
          .selectFrom("messages")
          .select(["created_at"])
          .where("id", "=", memberInfo.last_read_message_id)
          .executeTakeFirst();

        if (lastReadMessage) {
          unreadCount = await db
            .selectFrom("messages as m")
            .select(sql`COUNT(*)::integer`.as("count"))
            .where("m.channel_id", "=", channel.id)
            .where("m.user_id", "!=", userId)
            .where("m.created_at", ">", lastReadMessage.created_at)
            .executeTakeFirst();
        } else {
          // Fallback if we can't find the last read message
          unreadCount = await db
            .selectFrom("messages as m")
            .select(sql`COUNT(*)::integer`.as("count"))
            .where("m.channel_id", "=", channel.id)
            .where("m.user_id", "!=", userId)
            .executeTakeFirst();
        }
      } else {
        // If no last read message, count all messages from other users
        unreadCount = await db
          .selectFrom("messages as m")
          .select(sql`COUNT(*)::integer`.as("count"))
          .where("m.channel_id", "=", channel.id)
          .where("m.user_id", "!=", userId)
          .executeTakeFirst();
      }

      return {
        ...channel,
        other_user: otherMember || null,
        last_message: lastMessage || null,
        unread_count: unreadCount?.count || 0,
      };
    })
  );

  // Sort by last message date (most recent first)
  return channelsWithUsers.sort((a, b) => {
    const dateA = a.last_message?.created_at
      ? new Date(a.last_message.created_at).getTime()
      : 0;
    const dateB = b.last_message?.created_at
      ? new Date(b.last_message.created_at).getTime()
      : 0;
    return dateB - dateA;
  });
}

/**
 * Marks all messages in a DM channel as read
 *
 * @param channelId - The ID of the channel
 * @param userId - The ID of the user
 */
export async function markDMChannelAsRead(channelId: string, userId: string) {
  // Get the latest message in the channel
  const latestMessage = await db
    .selectFrom("messages")
    .select(["id"])
    .where("channel_id", "=", channelId)
    .orderBy("created_at", "desc")
    .limit(1)
    .executeTakeFirst();

  if (!latestMessage) {
    return;
  }

  // Update the last read message ID
  await db
    .updateTable("channel_members")
    .set({
      last_read_message_id: latestMessage.id,
      updated_at: new Date().toISOString(),
    })
    .where("channel_id", "=", channelId)
    .where("user_id", "=", userId)
    .execute();
}
