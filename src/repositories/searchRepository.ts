import { db } from "../db/database";
import { isWorkspaceMember } from "./workspaceRepository";

/**
 * Interface for search options
 */
export interface SearchOptions {
  workspaceId: string;
  query: string;
  userId: string;
  limit?: number;
  offset?: number;
  type?: 'messages' | 'channels' | 'users' | 'files' | 'all';
}

/**
 * Search for content in a workspace
 * 
 * @param options - Search options
 * @returns Search results
 */
export async function searchWorkspace(options: SearchOptions) {
  // Check if user is a member of the workspace
  const isMember = await isWorkspaceMember(options.workspaceId, options.userId);
  
  if (!isMember) {
    throw new Error("You must be a member of the workspace to search");
  }
  
  const limit = options.limit || 20;
  const offset = options.offset || 0;
  const type = options.type || 'all';
  
  // Prepare results object
  const results: any = {
    messages: [],
    channels: [],
    users: [],
    files: [],
    total: 0
  };
  
  // Search messages
  if (type === 'all' || type === 'messages') {
    const messages = await searchMessages(options.workspaceId, options.query, options.userId, limit, offset);
    results.messages = messages;
    results.total += messages.length;
  }
  
  // Search channels
  if (type === 'all' || type === 'channels') {
    const channels = await searchChannels(options.workspaceId, options.query, options.userId, limit, offset);
    results.channels = channels;
    results.total += channels.length;
  }
  
  // Search users
  if (type === 'all' || type === 'users') {
    const users = await searchUsers(options.workspaceId, options.query, limit, offset);
    results.users = users;
    results.total += users.length;
  }
  
  // Search files
  if (type === 'all' || type === 'files') {
    const files = await searchFiles(options.workspaceId, options.query, options.userId, limit, offset);
    results.files = files;
    results.total += files.length;
  }
  
  return results;
}

/**
 * Search for messages in a workspace
 * 
 * @param workspaceId - The ID of the workspace
 * @param query - The search query
 * @param userId - The ID of the user performing the search
 * @param limit - Maximum number of results
 * @param offset - Offset for pagination
 * @returns Array of matching messages
 */
async function searchMessages(
  workspaceId: string,
  query: string,
  userId: string,
  limit: number,
  offset: number
) {
  return db
    .selectFrom("messages")
    .innerJoin("channels", "channels.id", "messages.channel_id")
    .innerJoin("users", "users.id", "messages.user_id")
    .select([
      "messages.id",
      "messages.content",
      "messages.channel_id",
      "messages.created_at",
      "channels.name as channel_name",
      "users.username",
      "users.first_name",
      "users.last_name",
      "users.avatar_url",
    ])
    .where("channels.workspace_id", "=", workspaceId)
    .where("messages.deleted_at", "is", null)
    .where(eb => eb.or([
      // Search in public channels
      eb.and([
        eb("channels.is_private", "=", false),
        eb("messages.content", "ilike", `%${query}%`)
      ]),
      // Search in private channels the user is a member of
      eb.and([
        eb("channels.is_private", "=", true),
        eb.exists(
          eb.selectFrom("channel_members")
            .select("id")
            .where("channel_id", "=", eb.ref("channels.id"))
            .where("user_id", "=", userId)
        ),
        eb("messages.content", "ilike", `%${query}%`)
      ])
    ]))
    .orderBy("messages.created_at", "desc")
    .limit(limit)
    .offset(offset)
    .execute();
}

/**
 * Search for channels in a workspace
 * 
 * @param workspaceId - The ID of the workspace
 * @param query - The search query
 * @param userId - The ID of the user performing the search
 * @param limit - Maximum number of results
 * @param offset - Offset for pagination
 * @returns Array of matching channels
 */
async function searchChannels(
  workspaceId: string,
  query: string,
  userId: string,
  limit: number,
  offset: number
) {
  return db
    .selectFrom("channels")
    .selectAll()
    .where("workspace_id", "=", workspaceId)
    .where("deleted_at", "is", null)
    .where(eb => eb.or([
      // Public channels matching query
      eb.and([
        eb("is_private", "=", false),
        eb.or([
          eb("name", "ilike", `%${query}%`),
          eb("description", "ilike", `%${query}%`)
        ])
      ]),
      // Private channels the user is a member of matching query
      eb.and([
        eb("is_private", "=", true),
        eb.exists(
          eb.selectFrom("channel_members")
            .select("id")
            .where("channel_id", "=", eb.ref("channels.id"))
            .where("user_id", "=", userId)
        ),
        eb.or([
          eb("name", "ilike", `%${query}%`),
          eb("description", "ilike", `%${query}%`)
        ])
      ])
    ]))
    .orderBy("created_at", "desc")
    .limit(limit)
    .offset(offset)
    .execute();
}

/**
 * Search for users in a workspace
 * 
 * @param workspaceId - The ID of the workspace
 * @param query - The search query
 * @param limit - Maximum number of results
 * @param offset - Offset for pagination
 * @returns Array of matching users
 */
async function searchUsers(
  workspaceId: string,
  query: string,
  limit: number,
  offset: number
) {
  return db
    .selectFrom("users")
    .innerJoin("workspace_members", "workspace_members.user_id", "users.id")
    .select([
      "users.id",
      "users.username",
      "users.email",
      "users.first_name",
      "users.last_name",
      "users.avatar_url",
      "workspace_members.role",
    ])
    .where("workspace_members.workspace_id", "=", workspaceId)
    .where(eb => eb.or([
      eb("users.username", "ilike", `%${query}%`),
      eb("users.email", "ilike", `%${query}%`),
      eb("users.first_name", "ilike", `%${query}%`),
      eb("users.last_name", "ilike", `%${query}%`),
    ]))
    .orderBy("users.username")
    .limit(limit)
    .offset(offset)
    .execute();
}

/**
 * Search for files in a workspace
 * 
 * @param workspaceId - The ID of the workspace
 * @param query - The search query
 * @param userId - The ID of the user performing the search
 * @param limit - Maximum number of results
 * @param offset - Offset for pagination
 * @returns Array of matching files
 */
async function searchFiles(
  workspaceId: string,
  query: string,
  userId: string,
  limit: number,
  offset: number
) {
  return db
    .selectFrom("files")
    .innerJoin("users", "users.id", "files.uploaded_by")
    .select([
      "files.id",
      "files.name",
      "files.mime_type",
      "files.size",
      "files.created_at",
      "users.username as uploaded_by_username",
      "users.first_name as uploaded_by_first_name",
      "users.last_name as uploaded_by_last_name",
    ])
    .where("files.workspace_id", "=", workspaceId)
    .where("files.deleted_at", "is", null)
    .where(eb => eb.or([
      // Public files matching query
      eb.and([
        eb("files.is_public", "=", true),
        eb("files.name", "ilike", `%${query}%`)
      ]),
      // Files uploaded by the user matching query
      eb.and([
        eb("files.uploaded_by", "=", userId),
        eb("files.name", "ilike", `%${query}%`)
      ])
    ]))
    .orderBy("files.created_at", "desc")
    .limit(limit)
    .offset(offset)
    .execute();
}
