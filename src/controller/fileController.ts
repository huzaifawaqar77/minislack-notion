import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import * as fileRepository from "../repositories/fileRepository";

/**
 * Uploads a file
 */
export async function uploadFileController(req: AuthenticatedRequest, res: Response) {
  try {
    const { workspaceId } = req.params;
    const { isPublic } = req.body;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded"
      });
    }
    
    const file = await fileRepository.uploadFile({
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer,
      workspaceId,
      userId: req.user.id,
      isPublic: isPublic === "true" || isPublic === true
    });
    
    return res.status(201).json({
      status: "success",
      data: file
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to upload file"
    });
  }
}

/**
 * Gets all files in a workspace
 */
export async function getWorkspaceFilesController(req: AuthenticatedRequest, res: Response) {
  try {
    const { workspaceId } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const files = await fileRepository.getWorkspaceFiles(workspaceId, req.user.id);
    
    return res.status(200).json({
      status: "success",
      data: files
    });
  } catch (error: any) {
    console.error("Error getting files:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to get files"
    });
  }
}

/**
 * Gets a file by ID
 */
export async function getFileController(req: AuthenticatedRequest, res: Response) {
  try {
    const { fileId } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const file = await fileRepository.getFileById(fileId);
    
    if (!file) {
      return res.status(404).json({
        status: "error",
        message: "File not found"
      });
    }
    
    // Check if user has access to the file
    const hasAccess = await fileRepository.hasFileAccess(fileId, req.user.id);
    
    if (!hasAccess) {
      return res.status(403).json({
        status: "error",
        message: "You don't have permission to access this file"
      });
    }
    
    return res.status(200).json({
      status: "success",
      data: file
    });
  } catch (error: any) {
    console.error("Error getting file:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get file"
    });
  }
}

/**
 * Updates a file
 */
export async function updateFileController(req: AuthenticatedRequest, res: Response) {
  try {
    const { fileId } = req.params;
    const { name, isPublic } = req.body;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const file = await fileRepository.updateFile(
      fileId,
      {
        name,
        isPublic: isPublic !== undefined ? (isPublic === "true" || isPublic === true) : undefined
      },
      req.user.id
    );
    
    return res.status(200).json({
      status: "success",
      data: file
    });
  } catch (error: any) {
    console.error("Error updating file:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to update file"
    });
  }
}

/**
 * Deletes a file
 */
export async function deleteFileController(req: AuthenticatedRequest, res: Response) {
  try {
    const { fileId } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    await fileRepository.deleteFile(fileId, req.user.id);
    
    return res.status(200).json({
      status: "success",
      message: "File deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting file:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to delete file"
    });
  }
}

/**
 * Downloads a file
 */
export async function downloadFileController(req: AuthenticatedRequest, res: Response) {
  try {
    const { fileId } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const fileInfo = await fileRepository.getFilePath(fileId, req.user.id);
    
    // Set content disposition and type
    res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.name}"`);
    res.setHeader('Content-Type', fileInfo.mimeType);
    
    // Stream the file
    return res.sendFile(fileInfo.path);
  } catch (error: any) {
    console.error("Error downloading file:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to download file"
    });
  }
}
