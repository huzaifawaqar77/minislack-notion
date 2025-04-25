import axios from "axios";
import { getApiUrl, getAuthHeaders } from "./apiHelpers";

export interface Notification {
  id: string;
  type: string;
  title: string;
  content: string; // Changed from message to content
  action_url?: string; // Added action_url
  data?: any;
  workspace_id?: string;
  channel_id?: string;
  message_id?: string;
  sender_id?: string;
  sender_username?: string;
  sender_first_name?: string;
  sender_last_name?: string;
  sender_avatar_url?: string;
  is_read: boolean;
  created_at: string;
}

export const notificationApi = {
  // Get all notifications for the current user
  getNotifications: async (limit = 20, offset = 0, unreadOnly = false) => {
    try {
      // Log the request details for debugging
      console.log("Fetching notifications with params:", {
        limit,
        offset,
        unreadOnly,
      });
      console.log("Auth token:", localStorage.getItem("auth_token"));

      // Build the URL with query parameters
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      params.append("offset", offset.toString());
      params.append("unreadOnly", unreadOnly.toString());

      const url = getApiUrl(`/notifications?${params.toString()}`);
      console.log("Request URL:", url);

      // Make the request with proper headers
      const headers = getAuthHeaders();
      console.log("Request headers:", headers);

      const response = await axios.get(url, {
        headers,
        withCredentials: true,
      });

      console.log("Notification response:", response.data);
      return response.data.data as Notification[];
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      // Log detailed error information
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }

      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to fetch notifications"
        );
      }
      throw new Error("Failed to fetch notifications. Please try again.");
    }
  },

  // Get unread notification count
  getUnreadCount: async () => {
    try {
      console.log("Fetching unread notification count");

      const url = getApiUrl("/notifications/unread/count");
      console.log("Request URL:", url);

      const headers = getAuthHeaders();
      console.log("Request headers:", headers);

      const response = await axios.get(url, {
        headers,
        withCredentials: true,
      });

      console.log("Unread count response:", response.data);
      return response.data.data.count as number;
    } catch (error: any) {
      console.error("Error fetching unread notification count:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message ||
            "Failed to fetch unread notification count"
        );
      }
      throw new Error(
        "Failed to fetch unread notification count. Please try again."
      );
    }
  },

  // Mark a notification as read
  markAsRead: async (notificationId: string) => {
    try {
      console.log(`Marking notification ${notificationId} as read`);

      const url = getApiUrl(`/notifications/${notificationId}/read`);
      console.log("Request URL:", url);

      const headers = getAuthHeaders();
      console.log("Request headers:", headers);

      const response = await axios.put(
        url,
        {},
        {
          headers,
          withCredentials: true,
        }
      );

      console.log("Mark as read response:", response.data);
      return response.data.data as Notification;
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to mark notification as read"
        );
      }
      throw new Error("Failed to mark notification as read. Please try again.");
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      console.log("Marking all notifications as read");

      const url = getApiUrl("/notifications/read-all");
      console.log("Request URL:", url);

      const headers = getAuthHeaders();
      console.log("Request headers:", headers);

      const response = await axios.put(
        url,
        {},
        {
          headers,
          withCredentials: true,
        }
      );

      console.log("Mark all as read response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message ||
            "Failed to mark all notifications as read"
        );
      }
      throw new Error(
        "Failed to mark all notifications as read. Please try again."
      );
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId: string) => {
    try {
      console.log(`Deleting notification ${notificationId}`);

      const url = getApiUrl(`/notifications/${notificationId}`);
      console.log("Request URL:", url);

      const headers = getAuthHeaders();
      console.log("Request headers:", headers);

      const response = await axios.delete(url, {
        headers,
        withCredentials: true,
      });

      console.log("Delete notification response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to delete notification"
        );
      }
      throw new Error("Failed to delete notification. Please try again.");
    }
  },
};
