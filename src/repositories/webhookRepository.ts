import { db } from "../db/database";
import crypto from "crypto";
import axios from "axios";
import { getWorkspaceRole } from "./workspaceRepository";

/**
 * Interface for webhook creation
 */
export interface CreateWebhookInput {
  name: string;
  url: string;
  events: string[];
  workspaceId: string;
  createdBy: string;
}

/**
 * Interface for webhook update
 */
export interface UpdateWebhookInput {
  name?: string;
  url?: string;
  events?: string[];
  isActive?: boolean;
}

/**
 * Creates a new webhook
 * 
 * @param input - Webhook creation input
 * @returns The created webhook
 */
export async function createWebhook(input: CreateWebhookInput) {
  // Check if user has permission to create webhooks
  const role = await getWorkspaceRole(input.workspaceId, input.createdBy);
  
  if (!role || (role !== "admin" && role !== "owner")) {
    throw new Error("You don't have permission to create webhooks");
  }
  
  // Generate a secret
  const secret = crypto.randomBytes(32).toString('hex');
  
  // Create the webhook
  const webhook = await db
    .insertInto("webhooks")
    .values({
      id: crypto.randomUUID(),
      name: input.name,
      url: input.url,
      events: JSON.stringify(input.events),
      workspace_id: input.workspaceId,
      created_by: input.createdBy,
      secret,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  
  return webhook;
}

/**
 * Gets a webhook by ID
 * 
 * @param id - The ID of the webhook
 * @returns The webhook or null if not found
 */
export async function getWebhookById(id: string) {
  return db
    .selectFrom("webhooks")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}

/**
 * Gets all webhooks for a workspace
 * 
 * @param workspaceId - The ID of the workspace
 * @returns Array of webhooks
 */
export async function getWorkspaceWebhooks(workspaceId: string) {
  return db
    .selectFrom("webhooks")
    .select([
      "id",
      "name",
      "url",
      "events",
      "workspace_id",
      "created_by",
      "is_active",
      "created_at",
      "updated_at",
    ])
    .where("workspace_id", "=", workspaceId)
    .orderBy("created_at", "desc")
    .execute();
}

/**
 * Updates a webhook
 * 
 * @param id - The ID of the webhook
 * @param input - The fields to update
 * @param userId - The ID of the user making the update
 * @returns The updated webhook
 */
export async function updateWebhook(id: string, input: UpdateWebhookInput, userId: string) {
  const webhook = await getWebhookById(id);
  
  if (!webhook) {
    throw new Error(`Webhook with ID '${id}' not found`);
  }
  
  // Check if user has permission to update webhooks
  const role = await getWorkspaceRole(webhook.workspace_id, userId);
  
  if (!role || (role !== "admin" && role !== "owner")) {
    throw new Error("You don't have permission to update webhooks");
  }
  
  return db
    .updateTable("webhooks")
    .set({
      name: input.name !== undefined ? input.name : webhook.name,
      url: input.url !== undefined ? input.url : webhook.url,
      events: input.events !== undefined ? JSON.stringify(input.events) : webhook.events,
      is_active: input.isActive !== undefined ? input.isActive : webhook.is_active,
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Deletes a webhook
 * 
 * @param id - The ID of the webhook
 * @param userId - The ID of the user making the deletion
 * @returns True if successful
 */
export async function deleteWebhook(id: string, userId: string) {
  const webhook = await getWebhookById(id);
  
  if (!webhook) {
    throw new Error(`Webhook with ID '${id}' not found`);
  }
  
  // Check if user has permission to delete webhooks
  const role = await getWorkspaceRole(webhook.workspace_id, userId);
  
  if (!role || (role !== "admin" && role !== "owner")) {
    throw new Error("You don't have permission to delete webhooks");
  }
  
  await db
    .deleteFrom("webhooks")
    .where("id", "=", id)
    .execute();
  
  return true;
}

/**
 * Triggers webhooks for an event
 * 
 * @param workspaceId - The ID of the workspace
 * @param event - The event name
 * @param payload - The event payload
 * @returns Array of webhook delivery results
 */
export async function triggerWebhooks(workspaceId: string, event: string, payload: any) {
  // Get all active webhooks for the workspace that are subscribed to the event
  const webhooks = await db
    .selectFrom("webhooks")
    .selectAll()
    .where("workspace_id", "=", workspaceId)
    .where("is_active", "=", true)
    .execute();
  
  const results = [];
  
  for (const webhook of webhooks) {
    // Check if the webhook is subscribed to the event
    const events = JSON.parse(webhook.events as string);
    
    if (!events.includes(event) && !events.includes('*')) {
      continue;
    }
    
    // Create the webhook payload
    const webhookPayload = {
      id: crypto.randomUUID(),
      event,
      timestamp: new Date().toISOString(),
      workspace_id: workspaceId,
      data: payload,
    };
    
    // Create a signature for the payload
    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(JSON.stringify(webhookPayload))
      .digest('hex');
    
    // Send the webhook request
    try {
      const response = await axios.post(webhook.url, webhookPayload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-ID': webhookPayload.id,
          'X-Webhook-Event': event,
        },
        timeout: 5000, // 5 second timeout
      });
      
      results.push({
        webhookId: webhook.id,
        success: true,
        statusCode: response.status,
      });
    } catch (error: any) {
      results.push({
        webhookId: webhook.id,
        success: false,
        statusCode: error.response?.status,
        error: error.message,
      });
    }
  }
  
  return results;
}
