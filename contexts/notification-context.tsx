"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import { useWebSocket } from "./websocket-context";
import { notificationApi, Notification } from "@/lib/api/notificationApi";
import { toast } from "sonner";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: (
    limit?: number,
    offset?: number,
    unreadOnly?: boolean
  ) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, token } = useAuth();
  const { isConnected, subscribe } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!isConnected || !isAuthenticated) return;

    // Subscribe to new notifications
    const notificationUnsubscribe = subscribe(
      "notification",
      (notification) => {
        console.log("New notification received:", notification);

        // Add the new notification to the list
        setNotifications((prev) => [notification, ...prev]);

        // Update unread count
        setUnreadCount((prev) => prev + 1);

        // Show a toast notification
        toast.info(notification.title, {
          description: notification.content,
          duration: 5000,
          action: {
            label: "View",
            onClick: () => {
              // Mark as read when clicked
              markAsRead(notification.id);

              // Navigate to relevant page based on action_url or notification type
              if (notification.action_url) {
                window.location.href = notification.action_url;
              } else if (notification.channel_id) {
                window.location.href = `/dashboard/channels/${notification.channel_id}`;
              } else if (notification.workspace_id) {
                window.location.href = `/dashboard/workspaces/${notification.workspace_id}`;
              }
            },
          },
        });
      }
    );

    // Subscribe to unread count updates
    const unreadCountUnsubscribe = subscribe(
      "notification:unread_count",
      (data) => {
        console.log("Unread notification count update:", data);
        setUnreadCount(data.count);
      }
    );

    return () => {
      notificationUnsubscribe();
      unreadCountUnsubscribe();
    };
  }, [isConnected, isAuthenticated, subscribe]);

  // Fetch notifications
  const fetchNotifications = async (
    limit = 20,
    offset = 0,
    unreadOnly = false
  ) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const data = await notificationApi.getNotifications(
        limit,
        offset,
        unreadOnly
      );
      setNotifications(data);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      setError(error.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;

    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error: any) {
      console.error("Error fetching unread notification count:", error);
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    if (!isAuthenticated) return;

    try {
      await notificationApi.markAsRead(notificationId);

      // Update the notification in the list
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!isAuthenticated) return;

    try {
      await notificationApi.markAllAsRead();

      // Update all notifications in the list
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, is_read: true }))
      );

      // Reset unread count
      setUnreadCount(0);

      toast.success("All notifications marked as read");
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId: string) => {
    if (!isAuthenticated) return;

    try {
      await notificationApi.deleteNotification(notificationId);

      // Remove the notification from the list
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );

      // Update unread count if the notification was unread
      const wasUnread = notifications.find(
        (n) => n.id === notificationId && !n.is_read
      );
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      toast.success("Notification deleted");
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
}
