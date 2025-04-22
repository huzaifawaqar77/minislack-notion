import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import * as channelRepository from "../repositories/channelRepository";
import * as dmRepository from "../repositories/dmRepository";

/**
 * Creates a new channel
 */
export async function createChannelController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { workspaceId } = req.params;
    const { name, description, isPrivate } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Channel name is required",
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const channel = await channelRepository.createChannel({
      name,
      description,
      isPrivate,
      workspaceId,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      status: "success",
      data: channel,
    });
  } catch (error: any) {
    console.error("Error creating channel:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to create channel",
    });
  }
}

/**
 * Gets all channels in a workspace that the user has access to
 */
export async function getChannelsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { workspaceId } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const channels = await channelRepository.getChannelsForUser(
      workspaceId,
      req.user.id
    );

    return res.status(200).json({
      status: "success",
      data: channels,
    });
  } catch (error: any) {
    console.error("Error getting channels:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to get channels",
    });
  }
}

/**
 * Gets a channel by ID
 */
export async function getChannelController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    // Check if user has access to the channel
    const hasAccess = await channelRepository.isChannelMember(id, req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        status: "error",
        message: "You don't have access to this channel",
      });
    }

    const channel = await channelRepository.getChannelById(id);

    if (!channel) {
      return res.status(404).json({
        status: "error",
        message: "Channel not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: channel,
    });
  } catch (error: any) {
    console.error("Error getting channel:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get channel",
    });
  }
}

/**
 * Updates a channel
 */
export async function updateChannelController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;
    const { name, description, isPrivate } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const channel = await channelRepository.updateChannel(
      id,
      {
        name,
        description,
        isPrivate,
      },
      req.user.id
    );

    return res.status(200).json({
      status: "success",
      data: channel,
    });
  } catch (error: any) {
    console.error("Error updating channel:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to update channel",
    });
  }
}

/**
 * Deletes a channel
 */
export async function deleteChannelController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    await channelRepository.deleteChannel(id, req.user.id);

    return res.status(200).json({
      status: "success",
      message: "Channel deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting channel:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to delete channel",
    });
  }
}

/**
 * Gets all members of a channel
 */
export async function getChannelMembersController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    // Check if user has access to the channel
    const hasAccess = await channelRepository.isChannelMember(id, req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        status: "error",
        message: "You don't have access to this channel",
      });
    }

    const members = await channelRepository.getChannelMembers(id);

    return res.status(200).json({
      status: "success",
      data: members,
    });
  } catch (error: any) {
    console.error("Error getting channel members:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get channel members",
    });
  }
}

/**
 * Adds a member to a channel
 */
export async function addChannelMemberController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }

    const member = await channelRepository.addChannelMember(
      id,
      userId,
      req.user.id
    );

    return res.status(201).json({
      status: "success",
      data: member,
    });
  } catch (error: any) {
    console.error("Error adding channel member:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to add channel member",
    });
  }
}

/**
 * Removes a member from a channel
 */
export async function removeChannelMemberController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id, userId } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    await channelRepository.removeChannelMember(id, userId, req.user.id);

    return res.status(200).json({
      status: "success",
      message: "Member removed successfully",
    });
  } catch (error: any) {
    console.error("Error removing channel member:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to remove channel member",
    });
  }
}

/**
 * Marks a channel as read
 */
export async function markChannelAsReadController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { channelId } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    // Check if user has access to the channel
    const hasAccess = await channelRepository.isChannelMember(
      channelId,
      req.user.id
    );

    if (!hasAccess) {
      return res.status(403).json({
        status: "error",
        message: "You don't have access to this channel",
      });
    }

    // Mark the channel as read
    await dmRepository.markDMChannelAsRead(channelId, req.user.id);

    return res.status(200).json({
      status: "success",
      message: "Channel marked as read",
    });
  } catch (error: any) {
    console.error("Error marking channel as read:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to mark channel as read",
    });
  }
}
