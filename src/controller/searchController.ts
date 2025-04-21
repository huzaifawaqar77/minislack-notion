import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import * as searchRepository from "../repositories/searchRepository";

/**
 * Searches for content in a workspace
 */
export async function searchWorkspaceController(req: AuthenticatedRequest, res: Response) {
  try {
    const { workspaceId } = req.params;
    const { query, type, limit, offset } = req.query;
    
    if (!query) {
      return res.status(400).json({
        status: "error",
        message: "Search query is required"
      });
    }
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const results = await searchRepository.searchWorkspace({
      workspaceId,
      query: query as string,
      userId: req.user.id,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      type: type as any
    });
    
    return res.status(200).json({
      status: "success",
      data: results
    });
  } catch (error: any) {
    console.error("Error searching workspace:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to search workspace"
    });
  }
}
