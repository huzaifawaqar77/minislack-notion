import {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from "kysely";

export interface Database {
  person: PersonTable;
  pet: PetTable;
  User: UserTable;
}

// Users Table Interface
export interface UserTable {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  bio: string;
  status: string;
  title: string;
  phone: string;
  date_of_birth: Date;
  timezone: string;
  locale: string;
  last_active: Date;
  email_verified: boolean;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

// Workspace Table Interface
export interface WorkspaceTable {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon_url: string;
  banner_url: string;
  created_by: number;
  is_public: boolean;
  is_global: boolean;
  is_national: boolean;
  country_code: string;
  max_members: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

// Workspace Members Table Interface
export interface WorkspaceMembersTable {
  id: number;
  workspace_id: number;
  user_id: number;
  role: string;
  joined_at: Date;
  invited_by: string;
  is_favorite: boolean;
  notifications_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

// Channels Table Interface
export interface Channels {
  id: number;
  workspace_id: number;
  name: string;
  description: string;
  slug: string;
  is_private: boolean;
  is_direct: boolean;
  is_group_dm: boolean;
  created_by: number;
  icon_url: string;
  topic: string;
  has_retention_policy: boolean;
  retention_days: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

// Channels Members Interface
export interface ChannelMembersTable{
  id: number;
  channel_id: number;
  user_id: number;
  role: string;
  is_muted: boolean;
  notifications_enabled: boolean;
  last_read_message_id: number;
  joined_at: Date;
  created_at: Date;
  updated_at: Date;
}

// Messages Table Interface
export interface MessagesTable {
  id: number;
  channel_id: number;
  user_id: number;
  content: string;
  message_type: string;
  is_pinned: boolean;
  pinned_by: number;
  pinned_at: Date;
  is_edited: boolean;
  edited_at: Date;
  parent_id: number;
  has_attachments: boolean;
  reactions_count: number;
  thread_reply_count: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

// Messages Attachments Table
export interface MessageAttachmentsTable {
  id: number;
  message_id: number;
  file_id: number;
  created_at: Date;
}

// Message Reactions Table
export interface MessageReactionsTable {
  id: number;
  message_id: number;
  user_id: number;
  emoji: string;
  created_at: Date;
}

// Documents Table
export interface DocumentsTable {
  id: number;
  workspace_id: number;
  title: string;
  content: string; // JSONB format in database
  slug: string;
  parent_id: number;
  created_by: number;
  last_edited_by: number;
  is_favorite: boolean;
  is_template: boolean;
  is_pinned: boolean;
  is_archived: boolean;
  view_count: number;
  version: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

// Document Permissions Table
export interface DocumentPermissionsTable {
  id: number;
  document_id: number;
  user_id: number;
  workspace_id: number;
  channel_id: number;
  permission_level: number;
  created_at: Date;
  updated_at: Date;
}

// Document Collaborators Table
export interface DocumentCollaboratorsTable {
  id: number;
  document_id: number;
  user_id: number;
  cursor_position: string; // JSONB format in database
  last_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Document History Table
export interface DocumentHistoryTable {
  id: number;
  document_id: number;
  version: number;
  content: string; // JSONB format in database
  user_id: number;
  change_summary: string;
  created_at: Date;
}

// Files Table
export interface FilesTable {
  id: number;
  name: string;
  description: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_type: string;
  extension: string;
  uploaded_by: number;
  workspace_id: number;
  channel_id: number;
  document_id: number;
  is_public: boolean;
  download_count: number;
  thumbnail_url: string;
  preview_available: boolean;
  scan_status: string;
  metadata: string; // JSONB format in database
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

// Files Permissions Table
export interface FilePermissionsTable {
  id: number;
  file_id: number;
  user_id: number;
  workspace_id: number;
  channel_id: number;
  permission_level: number;
  created_at: Date;
  updated_at: Date;
}

// Meetings Table
export interface MeetingsTable {
  id: number;
  title: string;
  description: string;
  creator_id: number;
  workspace_id: number;
  channel_id: number;
  meeting_type: string;
  status: string;
  scheduled_start: Date;
  scheduled_end: Date;
  actual_start: Date;
  actual_end: Date;
  recurring: boolean;
  recurrence_pattern: string;
  max_participants: number;
  join_url: string;
  meeting_provider: string;
  external_meeting_id: number;
  recording_available: boolean;
  recording_url: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

// Meeting Participants Table
export interface MeetingParticipantsTable {
  id: number;
  meeting_id: number;
  user_id: number;
  status: string;
  joined_at: Date;
  left_at: Date;
  role: string;
  has_video: boolean;
  has_audio: boolean;
  created_at: Date;
  updated_at: Date;
}

// Code Snippets Table
export interface CodeSnippetsTable {
  id: number;
  title: string;
  content: string;
  language: string;
  user_id: number;
  workspace_id: number;
  channel_id: number;
  message_id: number;
  document_id: number;
  is_public: boolean;
  is_editable: boolean,
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

// Notifications Table
export interface NotificationsTable {
  id: number;
  user_id: number;
  type: string;
  title: string;
  content: string;
  is_read: boolean;
  action_url: string;
  sender_id: number;
  workspace_id: number;
  channel_id: number;
  message_id: number;
  document_id: number;
  meeting_id: number;
  created_at: Date;
  expires_at: Date;
}

// User Sessions Table
export interface UserSessionsTable {
  id: number;
  user_id: number;
  token: string;
  device_info: string; // JSONB format in database
  ip_address: string;
  location: string;
  is_active: boolean;
  last_active: boolean;
  created_at: Date;
  expires_at: Date;
}

// Tags Table
export interface TagsTable {
  id: number;
  name: string;
  color: string;
  workspace_id: number;
  created_by: number;
  created_at: Date;
}

// Taggable Items Table
export interface TaggableItemsTable {
  id: number;
  tag_id: number;
  taggable_type: string;
  taggable_id: number;
  created_by: number;
  created_at: Date;
}

// Webhooks Table
export interface WebhooksTable {
  id: number;
  workspace_id: number;
  name: string;
  url: string;
  events: string; // JSONB format in database
  is_active: boolean;
  secret: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

// Audit Logs Table
export interface AuditLogsTable {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  details: string; // JSONB format in database
  ip_address: string;
  user_agent: string;
  workspace_id: number;
  created_at: Date;
}

// This interface describes the `person` table to Kysely. Table
// interfaces should only be used in the `Database` type above
// and never as a result type of a query!. See the `Person`,
// `NewPerson` and `PersonUpdate` types below.
export interface PersonTable {
  // Columns that are generated by the database should be marked
  // using the `Generated` type. This way they are automatically
  // made optional in inserts and updates.
  id: Generated<number>;

  first_name: string;
  gender: "male" | "female" | "other";

  // If the column is nullable in the database, make its type nullable.
  // Don't use optional properties. Optionality is always determined
  // automatically by Kysely.
  last_name: string | null;

  // You can specify a different type for each operation (select, insert and
  // update) using the `ColumnType<SelectType, InsertType, UpdateType>`
  // wrapper. Here we define a column `created_at` that is selected as
  // a `Date`, can optionally be provided as a `string` in inserts and
  // can never be updated:
  created_at: ColumnType<Date, string | undefined, never>;

  // You can specify JSON columns using the `JSONColumnType` wrapper.
  // It is a shorthand for `ColumnType<T, string, string>`, where T
  // is the type of the JSON object/array retrieved from the database,
  // and the insert and update types are always `string` since you're
  // always stringifying insert/update values.
  metadata: JSONColumnType<{
    login_at: string;
    ip: string | null;
    agent: string | null;
    plan: "free" | "premium";
  }>;
}

// You should not use the table schema interfaces directly. Instead, you should
// use the `Selectable`, `Insertable` and `Updateable` wrappers. These wrappers
// make sure that the correct types are used in each operation.
//
// Most of the time you should trust the type inference and not use explicit
// types at all. These types can be useful when typing function arguments.
export type Person = Selectable<PersonTable>;
export type NewPerson = Insertable<PersonTable>;
export type PersonUpdate = Updateable<PersonTable>;

export interface PetTable {
  id: Generated<number>;
  name: string;
  owner_id: number;
  species: "dog" | "cat";
}

export type Pet = Selectable<PetTable>;
export type NewPet = Insertable<PetTable>;
export type PetUpdate = Updateable<PetTable>;
