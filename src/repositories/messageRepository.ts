import { db } from "../db/database";
import crypto from "crypto";
import { isChannelMember } from "./channelRepository";

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
    .executeTakeFirst();
}

/**
 * Interface for message creation
 */
export interface CreateMessageInput {
  content: string;
  channelId: string;
  userId: string;
  parentId?: string;
  attachments?: Array<{
    fileId: string;
    fileType: string;
    fileName: string;
  }>;
}

/**
 * Interface for message update
 */
export interface UpdateMessageInput {
  content: string;
}

/**
 * Creates a new message
 *
 * @param input - Message creation input
 * @returns The created message
 */
export async function createMessage(input: CreateMessageInput) {
  // Check if user has access to the channel
  const hasAccess = await isChannelMember(input.channelId, input.userId);

  if (!hasAccess) {
    throw new Error("You don't have access to this channel");
  }

  // Create the message
  const messageId = crypto.randomUUID();
  const message = await db
    .insertInto("messages")
    .values({
      id: messageId,
      content: input.content,
      channel_id: input.channelId,
      user_id: input.userId,
      parent_id: input.parentId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  // Add attachments if any
  if (input.attachments && input.attachments.length > 0) {
    const attachmentValues = input.attachments.map((attachment) => ({
      id: crypto.randomUUID(),
      message_id: messageId,
      file_id: attachment.fileId,
      file_type: attachment.fileType,
      file_name: attachment.fileName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    await db
      .insertInto("message_attachments")
      .values(attachmentValues)
      .execute();
  }

  return message;
}

/**
 * Gets a message by ID
 *
 * @param id - The ID of the message
 * @returns The message or null if not found
 */
export async function getMessageById(id: string) {
  return db
    .selectFrom("messages")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

/**
 * Gets a user by ID
 *
 * @param id - The ID of the user
 * @returns The user or null if not found
 */
export async function getUserById(id: string) {
  return db
    .selectFrom("users")
    .select([
      "id",
      "username",
      "email",
      "first_name",
      "last_name",
      "avatar_url",
    ])
    .where("id", "=", id)
    .executeTakeFirst();
}

/**
 * Gets messages in a channel with pagination
 *
 * @param channelId - The ID of the channel
 * @param userId - The ID of the user requesting messages
 * @param limit - Maximum number of messages to return
 * @param before - Get messages before this timestamp
 * @param after - Get messages after this timestamp
 * @returns Array of messages with user details
 */
export async function getChannelMessages(
  channelId: string,
  userId: string,
  limit: number = 50,
  before?: string,
  after?: string
) {
  // Check if user has access to the channel
  const hasAccess = await isChannelMember(channelId, userId);

  if (!hasAccess) {
    throw new Error("You don't have access to this channel");
  }

  // Build the query
  let query = db
    .selectFrom("messages")
    .innerJoin("users", "users.id", "messages.user_id")
    .leftJoin(
      "message_attachments",
      "message_attachments.message_id",
      "messages.id"
    )
    .select([
      "messages.id",
      "messages.content",
      "messages.channel_id",
      "messages.parent_id",
      "messages.created_at",
      "messages.updated_at",
      "users.id as user_id",
      "users.username",
      "users.first_name",
      "users.last_name",
      "users.avatar_url",
    ])
    .where("messages.channel_id", "=", channelId)
    .where("messages.deleted_at", "is", null);

  // Apply pagination
  if (before) {
    query = query.where("messages.created_at", "<", before);
  }

  if (after) {
    query = query.where("messages.created_at", ">", after);
  }

  // Get messages
  const messages = await query
    .orderBy("messages.created_at", "desc")
    .limit(limit)
    .execute();

  // Get attachments for these messages
  const messageIds = messages.map((message) => message.id);

  if (messageIds.length === 0) {
    return [];
  }

  const attachments = await db
    .selectFrom("message_attachments")
    .selectAll()
    .where("message_id", "in", messageIds)
    .execute();

  // Group attachments by message ID
  const attachmentsByMessageId = attachments.reduce(
    (acc, attachment) => {
      if (!acc[attachment.message_id]) {
        acc[attachment.message_id] = [];
      }
      acc[attachment.message_id].push(attachment);
      return acc;
    },
    {} as Record<string, any[]>
  );

  // Add attachments to messages
  const messagesWithAttachments = messages.map((message) => ({
    ...message,
    attachments: attachmentsByMessageId[message.id] || [],
  }));

  return messagesWithAttachments;
}

/**
 * Gets replies to a message
 *
 * @param parentId - The ID of the parent message
 * @param userId - The ID of the user requesting replies
 * @param limit - Maximum number of replies to return
 * @param before - Get replies before this timestamp
 * @returns Array of reply messages with user details
 */
export async function getMessageReplies(
  parentId: string,
  userId: string,
  limit: number = 50,
  before?: string
) {
  // Get the parent message
  const parentMessage = await getMessageById(parentId);

  if (!parentMessage) {
    throw new Error("Parent message not found");
  }

  // Check if user has access to the channel
  const hasAccess = await isChannelMember(parentMessage.channel_id, userId);

  if (!hasAccess) {
    throw new Error("You don't have access to this channel");
  }

  // Build the query
  let query = db
    .selectFrom("messages")
    .innerJoin("users", "users.id", "messages.user_id")
    .select([
      "messages.id",
      "messages.content",
      "messages.channel_id",
      "messages.parent_id",
      "messages.created_at",
      "messages.updated_at",
      "users.id as user_id",
      "users.username",
      "users.first_name",
      "users.last_name",
      "users.avatar_url",
    ])
    .where("messages.parent_id", "=", parentId)
    .where("messages.deleted_at", "is", null);

  // Apply pagination
  if (before) {
    query = query.where("messages.created_at", "<", before);
  }

  // Get replies
  const replies = await query
    .orderBy("messages.created_at", "asc")
    .limit(limit)
    .execute();

  // Get attachments for these messages
  const messageIds = replies.map((message) => message.id);

  if (messageIds.length === 0) {
    return [];
  }

  const attachments = await db
    .selectFrom("message_attachments")
    .selectAll()
    .where("message_id", "in", messageIds)
    .execute();

  // Group attachments by message ID
  const attachmentsByMessageId = attachments.reduce(
    (acc, attachment) => {
      if (!acc[attachment.message_id]) {
        acc[attachment.message_id] = [];
      }
      acc[attachment.message_id].push(attachment);
      return acc;
    },
    {} as Record<string, any[]>
  );

  // Add attachments to messages
  const repliesWithAttachments = replies.map((message) => ({
    ...message,
    attachments: attachmentsByMessageId[message.id] || [],
  }));

  return repliesWithAttachments;
}

/**
 * Updates a message
 *
 * @param id - The ID of the message
 * @param input - The fields to update
 * @param userId - The ID of the user making the update
 * @returns The updated message
 */
export async function updateMessage(
  id: string,
  input: UpdateMessageInput,
  userId: string
) {
  const message = await getMessageById(id);

  if (!message) {
    throw new Error(`Message with ID '${id}' not found`);
  }

  // Check if user is the message author
  if (message.user_id !== userId) {
    throw new Error("You can only edit your own messages");
  }

  return db
    .updateTable("messages")
    .set({
      content: input.content,
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Soft deletes a message
 *
 * @param id - The ID of the message
 * @param userId - The ID of the user making the deletion
 * @returns True if successful
 */
export async function deleteMessage(id: string, userId: string) {
  const message = await getMessageById(id);

  if (!message) {
    throw new Error(`Message with ID '${id}' not found`);
  }

  // Check if user is the message author
  if (message.user_id !== userId) {
    throw new Error("You can only delete your own messages");
  }

  await db
    .updateTable("messages")
    .set({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .execute();

  return true;
}

/**
 * Adds a reaction to a message
 *
 * @param messageId - The ID of the message
 * @param userId - The ID of the user adding the reaction
 * @param emoji - The emoji reaction
 * @returns The created reaction
 */
export async function addMessageReaction(
  messageId: string,
  userId: string,
  emoji: string
) {
  const message = await getMessageById(messageId);

  if (!message) {
    throw new Error(`Message with ID '${messageId}' not found`);
  }

  // Check if user has access to the channel
  const hasAccess = await isChannelMember(message.channel_id, userId);

  if (!hasAccess) {
    throw new Error("You don't have access to this channel");
  }

  // Check if reaction already exists
  const existingReaction = await db
    .selectFrom("message_reactions")
    .select(["id"])
    .where("message_id", "=", messageId)
    .where("user_id", "=", userId)
    .where("emoji", "=", emoji)
    .executeTakeFirst();

  if (existingReaction) {
    throw new Error("Reaction already exists");
  }

  // Add the reaction
  return db
    .insertInto("message_reactions")
    .values({
      id: crypto.randomUUID(),
      message_id: messageId,
      user_id: userId,
      emoji,
      created_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Removes a reaction from a message
 *
 * @param messageId - The ID of the message
 * @param userId - The ID of the user removing the reaction
 * @param emoji - The emoji reaction
 * @returns True if successful
 */
export async function removeMessageReaction(
  messageId: string,
  userId: string,
  emoji: string
) {
  await db
    .deleteFrom("message_reactions")
    .where("message_id", "=", messageId)
    .where("user_id", "=", userId)
    .where("emoji", "=", emoji)
    .execute();

  return true;
}

/**
 * Gets all reactions for a message
 *
 * @param messageId - The ID of the message
 * @returns Array of reactions grouped by emoji
 */
export async function getMessageReactions(messageId: string) {
  const reactions = await db
    .selectFrom("message_reactions")
    .innerJoin("users", "users.id", "message_reactions.user_id")
    .select([
      "message_reactions.emoji",
      "message_reactions.created_at",
      "users.id as user_id",
      "users.username",
      "users.first_name",
      "users.last_name",
      "users.avatar_url",
    ])
    .where("message_reactions.message_id", "=", messageId)
    .execute();

  // Group reactions by emoji
  const reactionsByEmoji = reactions.reduce(
    (acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push({
        user_id: reaction.user_id,
        username: reaction.username,
        first_name: reaction.first_name,
        last_name: reaction.last_name,
        avatar_url: reaction.avatar_url,
        created_at: reaction.created_at,
      });
      return acc;
    },
    {} as Record<string, any[]>
  );

  // Convert to array format
  return Object.entries(reactionsByEmoji).map(([emoji, users]) => ({
    emoji,
    count: users.length,
    users,
  }));
}
