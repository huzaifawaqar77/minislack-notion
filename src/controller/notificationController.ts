import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import * as notificationRepository from "../repositories/notificationRepository";
import { getIO } from "../index";

/**
 * Gets all notifications for the current user
 */
export async function getUserNotificationsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { limit, offset, unreadOnly } = req.query;

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const notifications = await notificationRepository.getUserNotifications(
      req.user.id,
      limit ? parseInt(limit as string) : undefined,
      offset ? parseInt(offset as string) : undefined,
      unreadOnly === "true"
    );

    return res.status(200).json({
      status: "success",
      data: notifications,
    });
  } catch (error: any) {
    console.error("Error getting notifications:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get notifications",
    });
  }
}

/**
 * Gets the count of unread notifications for the current user
 */
export async function getUnreadNotificationCountController(
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

    const count = await notificationRepository.getUnreadNotificationCount(
      req.user.id
    );

    return res.status(200).json({
      status: "success",
      data: { count },
    });
  } catch (error: any) {
    console.error("Error getting notification count:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get notification count",
    });
  }
}

/**
 * Marks a notification as read
 */
export async function markNotificationAsReadController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { notificationId } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const notification = await notificationRepository.markNotificationAsRead(
      notificationId,
      req.user.id
    );

    return res.status(200).json({
      status: "success",
      data: notification,
    });
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to mark notification as read",
    });
  }
}

/**
 * Marks all notifications as read for the current user
 */
export async function markAllNotificationsAsReadController(
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

    await notificationRepository.markAllNotificationsAsRead(req.user.id);

    return res.status(200).json({
      status: "success",
      message: "All notifications marked as read",
    });
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to mark all notifications as read",
    });
  }
}

/**
 * Deletes a notification
 */
export async function deleteNotificationController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { notificationId } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    await notificationRepository.deleteNotification(
      notificationId,
      req.user.id
    );

    return res.status(200).json({
      status: "success",
      message: "Notification deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to delete notification",
    });
  }
}

/**
 * Creates a test notification for the current user
 */
export async function createTestNotificationController(
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

    console.log(`Creating test notification for user: ${req.user.id}`);

    // Create a test notification
    const notification = await notificationRepository.createNotification({
      userId: req.user.id,
      type: "system",
      title: "Test Notification",
      content:
        "This is a test notification to verify the notification system is working correctly.",
      data: { timestamp: new Date().toISOString() },
      actionUrl: "/dashboard?tab=notifications",
    });

    console.log("Test notification created:", notification);

    // Emit the notification to the user's socket
    try {
      const io = getIO();
      io.to(`user:${req.user.id}`).emit("notification", notification);
      console.log(`Emitted notification to user:${req.user.id}`);
    } catch (socketError) {
      console.error("Error emitting notification:", socketError);
    }

    return res.status(200).json({
      status: "success",
      message: "Test notification created successfully",
      data: notification,
    });
  } catch (error: any) {
    console.error("Error creating test notification:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to create test notification",
    });
  }
}
