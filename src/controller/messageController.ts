import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import * as messageRepository from "../repositories/messageRepository";
import { emitToChannel } from "../services/socketService";
import { getIO } from "../index";

/**
 * Creates a new message
 */
export async function createMessageController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { channelId } = req.params;
    const { content, parentId, attachments } = req.body;

    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({
        status: "error",
        message: "Message content or attachments are required",
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    // Check if this is a DM channel
    const channel = await messageRepository.getChannelById(channelId);
    const isDirect = channel?.is_direct || false;

    const message = await messageRepository.createMessage({
      content: content || "",
      channelId,
      userId: req.user.id,
      parentId,
      attachments,
    });

    // Get user details for the message
    const user = await messageRepository.getUserById(req.user.id);

    // Prepare message data for socket emission
    const messageData = {
      id: message.id,
      content: message.content,
      channel_id: message.channel_id,
      channelId: message.channel_id, // Add channelId for consistency with WebSocket
      parent_id: message.parent_id,
      created_at: message.created_at,
      updated_at: message.updated_at,
      sender_id: req.user.id,
      user_id: req.user.id, // Add user_id for consistency
      sender_name: user
        ? `${user.first_name} ${user.last_name}`.trim() || user.username
        : "Unknown User",
      sender_avatar: user?.avatar_url,
      avatar_url: user?.avatar_url, // Add avatar_url for consistency
      username: user?.username, // Add username for consistency
      first_name: user?.first_name, // Add first_name for consistency
      last_name: user?.last_name, // Add last_name for consistency
      is_direct: isDirect, // Add is_direct flag for DM channels
      type: "message",
    };

    // Emit the message to all users in the channel
    const io = getIO();
    if (io) {
      // Log the message being broadcast
      console.log(
        `API: Broadcasting message to channel ${channelId}:`,
        messageData
      );

      // Broadcast to all clients in the channel
      emitToChannel(io, channelId, "message", messageData);

      // Also broadcast to all sockets directly as a fallback
      // This ensures messages reach all clients even if room joining failed
      console.log(
        `Fallback: Broadcasting message to all sockets for channel ${channelId}`
      );
      io.emit("message", {
        ...messageData,
        _fallback: true,
      });
    }

    return res.status(201).json({
      status: "success",
      data: message,
    });
  } catch (error: any) {
    console.error("Error creating message:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to create message",
    });
  }
}

/**
 * Gets messages in a channel with pagination
 */
export async function getChannelMessagesController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { channelId } = req.params;
    const { limit, before, after } = req.query;

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
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
      data: messages,
    });
  } catch (error: any) {
    console.error("Error getting messages:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to get messages",
    });
  }
}

/**
 * Gets replies to a message
 */
export async function getMessageRepliesController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { messageId } = req.params;
    const { limit, before } = req.query;

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
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
      data: replies,
    });
  } catch (error: any) {
    console.error("Error getting message replies:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to get message replies",
    });
  }
}

/**
 * Updates a message
 */
export async function updateMessageController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        status: "error",
        message: "Message content is required",
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const message = await messageRepository.updateMessage(
      messageId,
      { content },
      req.user.id
    );

    // Emit message update event
    const io = getIO();
    if (io) {
      emitToChannel(io, message.channel_id, "message:update", {
        id: message.id,
        content: message.content,
        channel_id: message.channel_id,
        updated_at: message.updated_at,
        type: "message:update",
      });
    }

    return res.status(200).json({
      status: "success",
      data: message,
    });
  } catch (error: any) {
    console.error("Error updating message:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to update message",
    });
  }
}

/**
 * Deletes a message
 */
export async function deleteMessageController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { messageId } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const message = await messageRepository.getMessageById(messageId);
    await messageRepository.deleteMessage(messageId, req.user.id);

    // Emit message delete event
    if (message) {
      const io = getIO();
      if (io) {
        emitToChannel(io, message.channel_id, "message:delete", {
          id: messageId,
          channel_id: message.channel_id,
          type: "message:delete",
        });
      }
    }

    return res.status(200).json({
      status: "success",
      message: "Message deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting message:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to delete message",
    });
  }
}

/**
 * Adds a reaction to a message
 */
export async function addReactionController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        status: "error",
        message: "Emoji is required",
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const reaction = await messageRepository.addMessageReaction(
      messageId,
      req.user.id,
      emoji
    );

    return res.status(201).json({
      status: "success",
      data: reaction,
    });
  } catch (error: any) {
    console.error("Error adding reaction:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to add reaction",
    });
  }
}

/**
 * Removes a reaction from a message
 */
export async function removeReactionController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { messageId, emoji } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    await messageRepository.removeMessageReaction(
      messageId,
      req.user.id,
      emoji
    );

    return res.status(200).json({
      status: "success",
      message: "Reaction removed successfully",
    });
  } catch (error: any) {
    console.error("Error removing reaction:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to remove reaction",
    });
  }
}

/**
 * Gets all reactions for a message
 */
export async function getReactionsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { messageId } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const reactions = await messageRepository.getMessageReactions(messageId);

    return res.status(200).json({
      status: "success",
      data: reactions,
    });
  } catch (error: any) {
    console.error("Error getting reactions:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to get reactions",
    });
  }
}
