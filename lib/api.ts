import axios from "axios";

// Create an axios instance with default config
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true, // Include cookies in requests
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if we're in the browser
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authApi = {
  // Get OAuth URLs
  getOAuthUrl: (provider: "google" | "github") => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return `${baseUrl}/auth/${provider}`;
  },
  // Register a new user
  register: async (userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }) => {
    try {
      // Format the request body to match the backend expectations
      const requestData = {
        email: userData.email,
        username: userData.username,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
      };

      const response = await api.post("/auth/register", requestData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || "Registration failed");
      }
      throw new Error("Registration failed. Please try again.");
    }
  },

  // Login a user
  login: async (credentials: { usernameOrEmail: string; password: string }) => {
    try {
      // Format the request body to match the backend expectations
      const requestData = {
        usernameOrEmail: credentials.usernameOrEmail,
        password: credentials.password,
      };

      console.log("Sending login request with data:", requestData);
      const response = await api.post("/auth/login", requestData);
      console.log("Login response:", response.data);

      // Store token and user data
      if (response.data.token) {
        // Store in localStorage for client-side access
        localStorage.setItem("auth_token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Also set a cookie for server-side middleware
        document.cookie = `auth_token=${response.data.token}; path=/; max-age=2592000; SameSite=Strict; secure`; // 30 days

        // Store CSRF token if provided
        if (response.data.csrfToken) {
          localStorage.setItem("csrf_token", response.data.csrfToken);
        }
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Login response error:", error.response.data);
        throw new Error(error.response.data.message || "Login failed");
      }
      throw new Error("Login failed. Please check your credentials.");
    }
  },

  // Logout the current user
  logout: () => {
    // Clear localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("csrf_token");

    // Clear cookies
    document.cookie =
      "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
  },

  // Check if the user is authenticated
  isAuthenticated: () => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("auth_token");
  },

  // Get the current user
  getCurrentUser: () => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Get the auth token
  getToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  },

  // Verify token validity
  verifyToken: async () => {
    try {
      // Use the sessions endpoint to check if the token is valid
      // This will return the user's active sessions if the token is valid
      const response = await api.get("/sessions");

      // If we get a successful response, the token is valid
      if (response.status === 200) {
        return {
          valid: true,
          user: authApi.getCurrentUser(),
          sessions: response.data.data,
        };
      }

      throw new Error("Invalid token");
    } catch (error) {
      console.error("Token verification failed:", error);
      // If token verification fails, clear local storage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      localStorage.removeItem("csrf_token");
      return null;
    }
  },
};

// User API calls
export const userApi = {
  // Search users
  searchUsers: async (query: string, workspaceId?: string) => {
    try {
      const params = new URLSearchParams();
      params.append("query", query);
      if (workspaceId) {
        params.append("workspaceId", workspaceId);
      }

      const response = await api.get(`/users/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to search users"
        );
      }
      throw new Error("Failed to search users. Please try again.");
    }
  },
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || "Failed to get profile");
      }
      throw new Error("Failed to get profile. Please try again.");
    }
  },

  // Update user profile
  updateProfile: async (profileData: {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
  }) => {
    try {
      // Format the request body to match the backend expectations
      const requestData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        username: profileData.username,
        email: profileData.email,
      };

      const response = await api.put("/auth/me", requestData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to update profile"
        );
      }
      throw new Error("Failed to update profile. Please try again.");
    }
  },
};

// Session API calls
export const sessionApi = {
  // Get all active sessions
  getSessions: async () => {
    try {
      const response = await api.get("/sessions");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to get sessions"
        );
      }
      throw new Error("Failed to get sessions. Please try again.");
    }
  },

  // Logout from a specific session
  logoutSession: async (sessionId: string) => {
    try {
      const response = await api.delete(`/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to logout session"
        );
      }
      throw new Error("Failed to logout session. Please try again.");
    }
  },
};

// Workspace API calls
export const workspaceApi = {
  // Get all workspaces
  getWorkspaces: async () => {
    try {
      const response = await api.get("/workspaces");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to get workspaces"
        );
      }
      throw new Error("Failed to get workspaces. Please try again.");
    }
  },

  // Create a new workspace
  createWorkspace: async (name: string) => {
    try {
      console.log("API Service: Creating workspace with name:", name);
      const response = await api.post("/workspaces", { name });
      console.log("API Service: Workspace creation response:", response.data);
      return response.data;
    } catch (error) {
      console.error("API Service: Error creating workspace:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to create workspace"
        );
      }
      throw new Error("Failed to create workspace. Please try again.");
    }
  },

  // Get a workspace by ID
  getWorkspace: async (id: string) => {
    try {
      const response = await api.get(`/workspaces/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to get workspace"
        );
      }
      throw new Error("Failed to get workspace. Please try again.");
    }
  },

  // Update a workspace
  updateWorkspace: async (
    id: string,
    data: { name?: string; description?: string; isPublic?: boolean }
  ) => {
    try {
      const response = await api.put(`/workspaces/${id}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to update workspace"
        );
      }
      throw new Error("Failed to update workspace. Please try again.");
    }
  },

  // Delete a workspace
  deleteWorkspace: async (id: string) => {
    try {
      const response = await api.delete(`/workspaces/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to delete workspace"
        );
      }
      throw new Error("Failed to delete workspace. Please try again.");
    }
  },

  // Get workspace members
  getWorkspaceMembers: async (id: string) => {
    try {
      const response = await api.get(`/workspaces/${id}/members`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to get workspace members"
        );
      }
      throw new Error("Failed to get workspace members. Please try again.");
    }
  },

  // Add a member to a workspace
  addWorkspaceMember: async (
    id: string,
    userId: string,
    role: string = "member"
  ) => {
    try {
      const response = await api.post(`/workspaces/${id}/members`, {
        userId,
        role,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to add workspace member"
        );
      }
      throw new Error("Failed to add workspace member. Please try again.");
    }
  },

  // Remove a member from a workspace
  removeWorkspaceMember: async (id: string, userId: string) => {
    try {
      const response = await api.delete(`/workspaces/${id}/members/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to remove workspace member"
        );
      }
      throw new Error("Failed to remove workspace member. Please try again.");
    }
  },

  // Invite a member to a workspace
  inviteWorkspaceMember: async (
    id: string,
    data: { email: string; role: string }
  ) => {
    try {
      const response = await api.post(`/workspaces/${id}/invitations`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to invite workspace member"
        );
      }
      throw new Error("Failed to invite workspace member. Please try again.");
    }
  },

  // Update a workspace member's role
  updateWorkspaceMemberRole: async (
    id: string,
    userId: string,
    role: string
  ) => {
    try {
      const response = await api.put(`/workspaces/${id}/members/${userId}`, {
        role,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message ||
            "Failed to update workspace member role"
        );
      }
      throw new Error(
        "Failed to update workspace member role. Please try again."
      );
    }
  },
};

// Channel API calls
export const channelApi = {
  // Get all channels in a workspace
  getChannels: async (workspaceId: string) => {
    try {
      const response = await api.get(`/workspaces/${workspaceId}/channels`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to get channels"
        );
      }
      throw new Error("Failed to get channels. Please try again.");
    }
  },

  // Create a new channel
  createChannel: async (
    workspaceId: string,
    data: { name: string; description?: string; isPrivate?: boolean }
  ) => {
    try {
      console.log("API Service: Creating channel with data:", data);
      const response = await api.post(
        `/workspaces/${workspaceId}/channels`,
        data
      );
      console.log("API Service: Channel creation response:", response.data);
      return response.data;
    } catch (error) {
      console.error("API Service: Error creating channel:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to create channel"
        );
      }
      throw new Error("Failed to create channel. Please try again.");
    }
  },

  // Get a channel by ID
  getChannel: async (channelId: string) => {
    try {
      const response = await api.get(`/channels/${channelId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || "Failed to get channel");
      }
      throw new Error("Failed to get channel. Please try again.");
    }
  },

  // Update a channel
  updateChannel: async (
    channelId: string,
    data: { name?: string; description?: string; isPrivate?: boolean }
  ) => {
    try {
      const response = await api.put(`/channels/${channelId}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to update channel"
        );
      }
      throw new Error("Failed to update channel. Please try again.");
    }
  },

  // Delete a channel
  deleteChannel: async (channelId: string) => {
    try {
      const response = await api.delete(`/channels/${channelId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to delete channel"
        );
      }
      throw new Error("Failed to delete channel. Please try again.");
    }
  },

  // Get channel members
  getChannelMembers: async (channelId: string) => {
    try {
      const response = await api.get(`/channels/${channelId}/members`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to get channel members"
        );
      }
      throw new Error("Failed to get channel members. Please try again.");
    }
  },

  // Add a member to a channel
  addChannelMember: async (channelId: string, userId: string) => {
    try {
      const response = await api.post(`/channels/${channelId}/members`, {
        userId,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to add channel member"
        );
      }
      throw new Error("Failed to add channel member. Please try again.");
    }
  },

  // Remove a member from a channel
  removeChannelMember: async (channelId: string, userId: string) => {
    try {
      const response = await api.delete(
        `/channels/${channelId}/members/${userId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to remove channel member"
        );
      }
      throw new Error("Failed to remove channel member. Please try again.");
    }
  },
};

// DM API calls
export const dmApi = {
  // Get all DM channels for the current user
  getDMChannels: async () => {
    try {
      const response = await api.get("/dm/channels");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to get DM channels"
        );
      }
      throw new Error("Failed to get DM channels. Please try again.");
    }
  },

  // Create or get a DM channel with another user
  createOrGetDMChannel: async (userId: string) => {
    try {
      const response = await api.post("/dm/channels", { userId });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to create DM channel"
        );
      }
      throw new Error("Failed to create DM channel. Please try again.");
    }
  },

  // Mark all messages in a DM channel as read
  markDMChannelAsRead: async (channelId: string) => {
    try {
      const response = await api.post(`/channels/${channelId}/read`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to mark channel as read"
        );
      }
      throw new Error("Failed to mark channel as read. Please try again.");
    }
  },
};

// Message API calls
export const messageApi = {
  // Get messages for a channel
  getChannelMessages: async (
    channelId: string,
    limit: number = 50,
    before?: string
  ) => {
    try {
      const url = new URL(
        `/channels/${channelId}/messages`,
        process.env.NEXT_PUBLIC_API_URL
      );
      if (limit) url.searchParams.append("limit", limit.toString());
      if (before) url.searchParams.append("before", before);

      const response = await api.get(url.pathname + url.search);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
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
      const response = await api.post(`/channels/${channelId}/messages`, {
        content,
        attachments,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
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
      const response = await api.put(
        `/channels/${channelId}/messages/${messageId}`,
        { content }
      );
      return response.data;
    } catch (error) {
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
      const response = await api.delete(
        `/channels/${channelId}/messages/${messageId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to delete message"
        );
      }
      throw new Error("Failed to delete message. Please try again.");
    }
  },
};

export default api;
