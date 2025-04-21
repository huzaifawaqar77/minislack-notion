import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import * as webhookRepository from "../repositories/webhookRepository";

/**
 * Creates a new webhook
 */
export async function createWebhookController(req: AuthenticatedRequest, res: Response) {
  try {
    const { workspaceId } = req.params;
    const { name, url, events } = req.body;
    
    if (!name || !url || !events) {
      return res.status(400).json({
        status: "error",
        message: "Name, URL, and events are required"
      });
    }
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const webhook = await webhookRepository.createWebhook({
      name,
      url,
      events,
      workspaceId,
      createdBy: req.user.id
    });
    
    // Don't return the secret in the response
    const { secret, ...webhookWithoutSecret } = webhook;
    
    return res.status(201).json({
      status: "success",
      data: webhookWithoutSecret
    });
  } catch (error: any) {
    console.error("Error creating webhook:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to create webhook"
    });
  }
}

/**
 * Gets all webhooks for a workspace
 */
export async function getWorkspaceWebhooksController(req: AuthenticatedRequest, res: Response) {
  try {
    const { workspaceId } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const webhooks = await webhookRepository.getWorkspaceWebhooks(workspaceId);
    
    return res.status(200).json({
      status: "success",
      data: webhooks
    });
  } catch (error: any) {
    console.error("Error getting webhooks:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get webhooks"
    });
  }
}

/**
 * Gets a webhook by ID
 */
export async function getWebhookController(req: AuthenticatedRequest, res: Response) {
  try {
    const { webhookId } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const webhook = await webhookRepository.getWebhookById(webhookId);
    
    if (!webhook) {
      return res.status(404).json({
        status: "error",
        message: "Webhook not found"
      });
    }
    
    // Don't return the secret in the response
    const { secret, ...webhookWithoutSecret } = webhook;
    
    return res.status(200).json({
      status: "success",
      data: webhookWithoutSecret
    });
  } catch (error: any) {
    console.error("Error getting webhook:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get webhook"
    });
  }
}

/**
 * Updates a webhook
 */
export async function updateWebhookController(req: AuthenticatedRequest, res: Response) {
  try {
    const { webhookId } = req.params;
    const { name, url, events, isActive } = req.body;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const webhook = await webhookRepository.updateWebhook(
      webhookId,
      {
        name,
        url,
        events,
        isActive
      },
      req.user.id
    );
    
    // Don't return the secret in the response
    const { secret, ...webhookWithoutSecret } = webhook;
    
    return res.status(200).json({
      status: "success",
      data: webhookWithoutSecret
    });
  } catch (error: any) {
    console.error("Error updating webhook:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to update webhook"
    });
  }
}

/**
 * Deletes a webhook
 */
export async function deleteWebhookController(req: AuthenticatedRequest, res: Response) {
  try {
    const { webhookId } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    await webhookRepository.deleteWebhook(webhookId, req.user.id);
    
    return res.status(200).json({
      status: "success",
      message: "Webhook deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting webhook:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to delete webhook"
    });
  }
}
