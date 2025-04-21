import { db } from "../db/database";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { isWorkspaceMember } from "./workspaceRepository";

// Define the base upload directory
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Interface for file upload
 */
export interface FileUploadInput {
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
  workspaceId: string;
  userId: string;
  isPublic?: boolean;
}

/**
 * Interface for file update
 */
export interface FileUpdateInput {
  name?: string;
  isPublic?: boolean;
}

/**
 * Uploads a file
 * 
 * @param input - File upload input
 * @returns The uploaded file metadata
 */
export async function uploadFile(input: FileUploadInput) {
  // Check if user is a member of the workspace
  const isMember = await isWorkspaceMember(input.workspaceId, input.userId);
  
  if (!isMember) {
    throw new Error("You must be a member of the workspace to upload files");
  }
  
  // Generate a unique filename
  const fileId = crypto.randomUUID();
  const fileExt = path.extname(input.originalName);
  const fileName = `${fileId}${fileExt}`;
  
  // Create workspace-specific directory if it doesn't exist
  const workspaceDir = path.join(UPLOAD_DIR, input.workspaceId);
  if (!fs.existsSync(workspaceDir)) {
    fs.mkdirSync(workspaceDir, { recursive: true });
  }
  
  // Save the file
  const filePath = path.join(workspaceDir, fileName);
  fs.writeFileSync(filePath, input.buffer);
  
  // Store file metadata in database
  const file = await db
    .insertInto("files")
    .values({
      id: fileId,
      name: input.originalName,
      mime_type: input.mimeType,
      size: input.size,
      path: `${input.workspaceId}/${fileName}`,
      workspace_id: input.workspaceId,
      uploaded_by: input.userId,
      is_public: input.isPublic !== undefined ? input.isPublic : false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  
  return file;
}

/**
 * Gets a file by ID
 * 
 * @param id - The ID of the file
 * @returns The file or null if not found
 */
export async function getFileById(id: string) {
  return db
    .selectFrom("files")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

/**
 * Gets all files in a workspace
 * 
 * @param workspaceId - The ID of the workspace
 * @param userId - The ID of the user requesting files
 * @returns Array of files
 */
export async function getWorkspaceFiles(workspaceId: string, userId: string) {
  // Check if user is a member of the workspace
  const isMember = await isWorkspaceMember(workspaceId, userId);
  
  if (!isMember) {
    throw new Error("You must be a member of the workspace to view files");
  }
  
  return db
    .selectFrom("files")
    .selectAll()
    .where("workspace_id", "=", workspaceId)
    .where("deleted_at", "is", null)
    .orderBy("created_at", "desc")
    .execute();
}

/**
 * Updates a file
 * 
 * @param id - The ID of the file
 * @param input - The fields to update
 * @param userId - The ID of the user making the update
 * @returns The updated file
 */
export async function updateFile(id: string, input: FileUpdateInput, userId: string) {
  const file = await getFileById(id);
  
  if (!file) {
    throw new Error(`File with ID '${id}' not found`);
  }
  
  // Check if user is the uploader or a workspace admin
  if (file.uploaded_by !== userId) {
    // Check if user is a workspace admin
    const isAdmin = await db
      .selectFrom("workspace_members")
      .select(["role"])
      .where("workspace_id", "=", file.workspace_id)
      .where("user_id", "=", userId)
      .where("role", "=", "admin")
      .executeTakeFirst();
    
    if (!isAdmin) {
      throw new Error("You don't have permission to update this file");
    }
  }
  
  return db
    .updateTable("files")
    .set({
      name: input.name !== undefined ? input.name : file.name,
      is_public: input.isPublic !== undefined ? input.isPublic : file.is_public,
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Soft deletes a file
 * 
 * @param id - The ID of the file
 * @param userId - The ID of the user making the deletion
 * @returns True if successful
 */
export async function deleteFile(id: string, userId: string) {
  const file = await getFileById(id);
  
  if (!file) {
    throw new Error(`File with ID '${id}' not found`);
  }
  
  // Check if user is the uploader or a workspace admin
  if (file.uploaded_by !== userId) {
    // Check if user is a workspace admin
    const isAdmin = await db
      .selectFrom("workspace_members")
      .select(["role"])
      .where("workspace_id", "=", file.workspace_id)
      .where("user_id", "=", userId)
      .where("role", "=", "admin")
      .executeTakeFirst();
    
    if (!isAdmin) {
      throw new Error("You don't have permission to delete this file");
    }
  }
  
  await db
    .updateTable("files")
    .set({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .execute();
  
  return true;
}

/**
 * Gets the file path for a file
 * 
 * @param id - The ID of the file
 * @param userId - The ID of the user requesting the file
 * @returns The file path and metadata
 */
export async function getFilePath(id: string, userId: string) {
  const file = await getFileById(id);
  
  if (!file) {
    throw new Error(`File with ID '${id}' not found`);
  }
  
  // If file is public, allow access
  if (file.is_public) {
    return {
      path: path.join(UPLOAD_DIR, file.path),
      mimeType: file.mime_type,
      name: file.name,
    };
  }
  
  // Check if user is a member of the workspace
  const isMember = await isWorkspaceMember(file.workspace_id, userId);
  
  if (!isMember) {
    throw new Error("You don't have permission to access this file");
  }
  
  return {
    path: path.join(UPLOAD_DIR, file.path),
    mimeType: file.mime_type,
    name: file.name,
  };
}

/**
 * Checks if a user has access to a file
 * 
 * @param id - The ID of the file
 * @param userId - The ID of the user
 * @returns True if the user has access
 */
export async function hasFileAccess(id: string, userId: string) {
  const file = await getFileById(id);
  
  if (!file) {
    return false;
  }
  
  // If file is public, allow access
  if (file.is_public) {
    return true;
  }
  
  // Check if user is a member of the workspace
  return isWorkspaceMember(file.workspace_id, userId);
}
