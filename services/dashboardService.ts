import { apiClient } from "./apiClient";

export interface DashboardStats {
  totalMessages: number;
  messageGrowth: number;
  activeUsers: number;
  userGrowth: number;
  activeChannels: number;
  totalChannels: number;
  newChannels: number;
  totalFiles: number;
  newFiles: number;
  topChannels: {
    channel_id: string;
    channel_name: string;
    message_count: number;
    percentage: number;
  }[];
  activityData: {
    date: string;
    count: number;
  }[];
}

/**
 * Fetches dashboard statistics for a workspace
 *
 * @param workspaceId - The ID of the workspace
 * @returns Dashboard statistics
 */
export const getWorkspaceDashboardStats = async (
  workspaceId: string
): Promise<DashboardStats> => {
  try {
    console.log(`Making API request to: /workspaces/${workspaceId}/dashboard`);
    const response = await apiClient.get(
      `/workspaces/${workspaceId}/dashboard`
    );
    console.log("API response:", response);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    if (error.response) {
      console.error("Response error details:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error("Request error (no response received):", error.request);
    }
    throw error;
  }
};
