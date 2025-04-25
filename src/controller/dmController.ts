import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import * as dmRepository from "../repositories/dmRepository";
import * as notificationService from "../services/notificationService";

/**
 * Creates a new DM channel or returns an existing one
 */
export async function createOrGetDMChannelController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    // Prevent self-messaging
    if (userId === req.user.id) {
      return res.status(400).json({
        status: "error",
        message: "Cannot create a DM channel with yourself",
      });
    }

    const channel = await dmRepository.createOrGetDMChannel(
      req.user.id,
      userId
    );

    // Emit a WebSocket event to notify the other user about the new DM channel
    if (req.io) {
      req.io.to(`user:${userId}`).emit("dm_channel_created", {
        channel_id: channel.id,
        created_by: req.user.id,
      });

      // Create a notification for the recipient
      await notificationService.createSystemNotification(
        userId,
        "New Direct Message",
        `You have a new direct message conversation`,
        {
          channelId: channel.id,
          senderId: req.user.id,
        }
      );
    }

    return res.status(200).json({
      status: "success",
      data: channel,
    });
  } catch (error: any) {
    console.error("Error creating/getting DM channel:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to create/get DM channel",
    });
  }
}

/**
 * Gets all DM channels for the current user
 */
export async function getUserDMChannelsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const channels = await dmRepository.getUserDMChannels(req.user.id);

    return res.status(200).json({
      status: "success",
      data: channels,
    });
  } catch (error: any) {
    console.error("Error getting user DM channels:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to get DM channels",
    });
  }
}
