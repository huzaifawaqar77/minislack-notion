import axios from "axios";
import { ApiResponse } from "@/types/api";

// Helper function to get the API URL
const getApiUrl = (endpoint: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  return `${baseUrl}${endpoint}`;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

export const messageApi = {
  // Get messages for a channel
  getChannelMessages: async (
    channelId: string,
    limit: number = 50,
    before?: string
  ) => {
    try {
      console.log(`Fetching messages for channel ${channelId} with limit ${limit}`);
      
      // Build the URL with query parameters
      let endpoint = `/channels/${channelId}/messages`;
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (before) params.append("before", before);
      
      const queryString = params.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
      
      const url = getApiUrl(endpoint);
      console.log(`Fetching messages from URL: ${url}`);
      
      const response = await axios.get(url, {
        headers: getAuthHeaders(),
      });
      
      console.log(`Successfully fetched ${response.data?.data?.length || 0} messages`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("API error response:", error.response.data);
        throw new Error(
          error.response.data.message || "Failed to get messages"
        );
      }
      throw new Error("Failed to get messages. Please try again.");
    }
  },

  // Send a message to a channel
  sendMessage: async (
    channelId: string,
    content: string,
    attachments?: string[]
  ) => {
    try {
      console.log(`Sending message to channel ${channelId}`);
      const url = getApiUrl(`/channels/${channelId}/messages`);
      
      const response = await axios.post(
        url,
        { content, attachments },
        { headers: getAuthHeaders() }
      );
      
      console.log("Message sent successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error sending message:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("API error response:", error.response.data);
        throw new Error(
          error.response.data.message || "Failed to send message"
        );
      }
      throw new Error("Failed to send message. Please try again.");
    }
  },

  // Update a message
  updateMessage: async (
    channelId: string,
    messageId: string,
    content: string
  ) => {
    try {
      const url = getApiUrl(`/channels/${channelId}/messages/${messageId}`);
      
      const response = await axios.put(
        url,
        { content },
        { headers: getAuthHeaders() }
      );
      
      return response.data;
    } catch (error: any) {
      console.error("Error updating message:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to update message"
        );
      }
      throw new Error("Failed to update message. Please try again.");
    }
  },

  // Delete a message
  deleteMessage: async (channelId: string, messageId: string) => {
    try {
      const url = getApiUrl(`/channels/${channelId}/messages/${messageId}`);
      
      const response = await axios.delete(url, {
        headers: getAuthHeaders(),
      });
      
      return response.data;
    } catch (error: any) {
      console.error("Error deleting message:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to delete message"
        );
      }
      throw new Error("Failed to delete message. Please try again.");
    }
  },
};
