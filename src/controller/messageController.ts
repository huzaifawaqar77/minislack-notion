import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import * as messageRepository from "../repositories/messageRepository";

/**
 * Creates a new message
 */
export async function createMessageController(req: AuthenticatedRequest, res: Response) {
  try {
    const { channelId } = req.params;
    const { content, parentId, attachments } = req.body;
    
    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({
        status: "error",
        message: "Message content or attachments are required"
      });
    }
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const message = await messageRepository.createMessage({
      content: content || "",
      channelId,
      userId: req.user.id,
      parentId,
      attachments
    });
    
    return res.status(201).json({
      status: "success",
      data: message
    });
  } catch (error: any) {
    console.error("Error creating message:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to create message"
    });
  }
}

/**
 * Gets messages in a channel with pagination
 */
export async function getChannelMessagesController(req: AuthenticatedRequest, res: Response) {
  try {
    const { channelId } = req.params;
    const { limit, before, after } = req.query;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const messages = await messageRepository.getChannelMessages(
      channelId,
      req.user.id,
      limit ? parseInt(limit as string) : undefined,
      before as string | undefined,
      after as string | undefined
    );
    
    return res.status(200).json({
      status: "success",
      data: messages
    });
  } catch (error: any) {
    console.error("Error getting messages:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to get messages"
    });
  }
}

/**
 * Gets replies to a message
 */
export async function getMessageRepliesController(req: AuthenticatedRequest, res: Response) {
  try {
    const { messageId } = req.params;
    const { limit, before } = req.query;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const replies = await messageRepository.getMessageReplies(
      messageId,
      req.user.id,
      limit ? parseInt(limit as string) : undefined,
      before as string | undefined
    );
    
    return res.status(200).json({
      status: "success",
      data: replies
    });
  } catch (error: any) {
    console.error("Error getting message replies:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to get message replies"
    });
  }
}

/**
 * Updates a message
 */
export async function updateMessageController(req: AuthenticatedRequest, res: Response) {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        status: "error",
        message: "Message content is required"
      });
    }
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const message = await messageRepository.updateMessage(
      messageId,
      { content },
      req.user.id
    );
    
    return res.status(200).json({
      status: "success",
      data: message
    });
  } catch (error: any) {
    console.error("Error updating message:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to update message"
    });
  }
}

/**
 * Deletes a message
 */
export async function deleteMessageController(req: AuthenticatedRequest, res: Response) {
  try {
    const { messageId } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    await messageRepository.deleteMessage(messageId, req.user.id);
    
    return res.status(200).json({
      status: "success",
      message: "Message deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting message:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to delete message"
    });
  }
}

/**
 * Adds a reaction to a message
 */
export async function addReactionController(req: AuthenticatedRequest, res: Response) {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    
    if (!emoji) {
      return res.status(400).json({
        status: "error",
        message: "Emoji is required"
      });
    }
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const reaction = await messageRepository.addMessageReaction(
      messageId,
      req.user.id,
      emoji
    );
    
    return res.status(201).json({
      status: "success",
      data: reaction
    });
  } catch (error: any) {
    console.error("Error adding reaction:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to add reaction"
    });
  }
}

/**
 * Removes a reaction from a message
 */
export async function removeReactionController(req: AuthenticatedRequest, res: Response) {
  try {
    const { messageId, emoji } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    await messageRepository.removeMessageReaction(
      messageId,
      req.user.id,
      emoji
    );
    
    return res.status(200).json({
      status: "success",
      message: "Reaction removed successfully"
    });
  } catch (error: any) {
    console.error("Error removing reaction:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to remove reaction"
    });
  }
}

/**
 * Gets all reactions for a message
 */
export async function getReactionsController(req: AuthenticatedRequest, res: Response) {
  try {
    const { messageId } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const reactions = await messageRepository.getMessageReactions(messageId);
    
    return res.status(200).json({
      status: "success",
      data: reactions
    });
  } catch (error: any) {
    console.error("Error getting reactions:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to get reactions"
    });
  }
}
