import { User } from "@/types/user";
import { ApiResponse } from "@/types/api";
import axios from "axios";

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

export const userApi = {
  /**
   * Get the current user's profile
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await axios.get(getApiUrl("/auth/me"), {
        headers: getAuthHeaders(),
      });
      return {
        status: "success",
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.response?.data?.message || "Failed to get profile",
      };
    }
  },

  /**
   * Get a user by ID
   */
  getUserById: async (userId: string): Promise<ApiResponse<User> | null> => {
    try {
      const response = await axios.get(getApiUrl(`/users/${userId}`), {
        headers: getAuthHeaders(),
      });
      return {
        status: "success",
        data: response.data.data,
      };
    } catch (error: any) {
      console.error(`Failed to get user ${userId}:`, error);
      return null;
    }
  },

  /**
   * Update the current user's profile
   */
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const response = await axios.put(getApiUrl("/auth/me"), data, {
        headers: getAuthHeaders(),
      });
      return {
        status: "success",
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.response?.data?.message || "Failed to update profile",
      };
    }
  },

  /**
   * Update the user's avatar
   */
  updateAvatar: async (file: File): Promise<ApiResponse<User>> => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      // Get auth headers but remove Content-Type as it will be set automatically for FormData
      const headers = getAuthHeaders();
      delete headers["Content-Type"];

      const response = await axios.post(
        getApiUrl("/auth/me/avatar"),
        formData,
        {
          headers: {
            ...headers,
            // Let the browser set the correct Content-Type for FormData
          },
        }
      );

      return {
        status: "success",
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: error.response?.data?.message || "Failed to update avatar",
      };
    }
  },
};
