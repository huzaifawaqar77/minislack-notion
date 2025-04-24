/**
 * Utility functions for API calls
 */

/**
 * Get the full API URL for an endpoint
 * @param endpoint - The API endpoint path
 * @returns The full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  return `${baseUrl}${endpoint}`;
};

/**
 * Get authentication headers for API requests
 * @returns Headers object with authentication token if available
 */
export const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};
