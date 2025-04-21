import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authMiddleware";
import { hasPermission, ResourceType, PermissionAction } from "../services/permissionService";

/**
 * Middleware to check if a user has permission to perform an action on a resource
 * 
 * @param resourceType - The type of resource
 * @param resourceIdParam - The name of the request parameter containing the resource ID
 * @param action - The action to perform
 * @returns Middleware function
 */
export function requirePermission(
  resourceType: ResourceType,
  resourceIdParam: string,
  action: PermissionAction
) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          status: "error",
          message: "Unauthorized"
        });
      }
      
      const resourceId = req.params[resourceIdParam];
      
      if (!resourceId) {
        return res.status(400).json({
          status: "error",
          message: `Resource ID parameter '${resourceIdParam}' is missing`
        });
      }
      
      const hasAccess = await hasPermission(req.user.id, resourceType, resourceId, action);
      
      if (!hasAccess) {
        return res.status(403).json({
          status: "error",
          message: "You don't have permission to perform this action"
        });
      }
      
      next();
    } catch (error) {
      console.error("Error checking permissions:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to check permissions"
      });
    }
  };
}

/**
 * Middleware to check if a user has permission to perform an action on a workspace
 * 
 * @param action - The action to perform
 * @returns Middleware function
 */
export function requireWorkspacePermission(action: PermissionAction) {
  return requirePermission(ResourceType.WORKSPACE, 'workspaceId', action);
}

/**
 * Middleware to check if a user has permission to perform an action on a channel
 * 
 * @param action - The action to perform
 * @returns Middleware function
 */
export function requireChannelPermission(action: PermissionAction) {
  return requirePermission(ResourceType.CHANNEL, 'channelId', action);
}

/**
 * Middleware to check if a user has permission to perform an action on a message
 * 
 * @param action - The action to perform
 * @returns Middleware function
 */
export function requireMessagePermission(action: PermissionAction) {
  return requirePermission(ResourceType.MESSAGE, 'messageId', action);
}

/**
 * Middleware to check if a user has permission to perform an action on a file
 * 
 * @param action - The action to perform
 * @returns Middleware function
 */
export function requireFilePermission(action: PermissionAction) {
  return requirePermission(ResourceType.FILE, 'fileId', action);
}
