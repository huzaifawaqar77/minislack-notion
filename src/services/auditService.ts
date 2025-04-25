import { db } from "../db/database";
import crypto from "crypto";

/**
 * Interface for audit event data
 */
export interface AuditEventData {
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  workspaceId: string | null;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Logs an audit event to the database
 *
 * @param data - The audit event data
 * @returns The created audit log entry
 */
export async function logAuditEvent(data: AuditEventData) {
  try {
    const auditLog = await db
      .insertInto("audit_logs")
      .values({
        id: crypto.randomUUID(),
        user_id: data.userId,
        action: data.action,
        entity_type: data.entityType,
        entity_id: data.entityId,
        workspace_id: data.workspaceId,
        details: data.details || null,
        ip_address: data.ipAddress || null,
        user_agent: data.userAgent || null,
        created_at: new Date().toISOString(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return auditLog;
  } catch (error) {
    console.error("Error logging audit event:", error);
    // Don't throw the error - audit logging should not break the main functionality
    return null;
  }
}

/**
 * Gets audit logs for a specific entity
 *
 * @param entityType - The type of entity
 * @param entityId - The ID of the entity
 * @returns Array of audit logs
 */
export async function getEntityAuditLogs(entityType: string, entityId: string) {
  return db
    .selectFrom("audit_logs")
    .selectAll()
    .where("entity_type", "=", entityType)
    .where("entity_id", "=", entityId)
    .orderBy("created_at", "desc")
    .execute();
}

/**
 * Gets audit logs for a workspace
 *
 * @param workspaceId - The ID of the workspace
 * @returns Array of audit logs
 */
export async function getWorkspaceAuditLogs(workspaceId: string) {
  return db
    .selectFrom("audit_logs")
    .selectAll()
    .where("workspace_id", "=", workspaceId)
    .orderBy("created_at", "desc")
    .execute();
}

/**
 * Gets audit logs for a user
 *
 * @param userId - The ID of the user
 * @returns Array of audit logs
 */
export async function getUserAuditLogs(userId: string) {
  return db
    .selectFrom("audit_logs")
    .selectAll()
    .where("user_id", "=", userId)
    .orderBy("created_at", "desc")
    .execute();
}
