/**
 * API helper functions for making requests to the backend
 */

/**
 * Get the full API URL for a given endpoint
 *
 * @param endpoint - The API endpoint (e.g., "/users")
 * @returns The full API URL
 */
export function getApiUrl(endpoint: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Make sure the endpoint starts with a slash
  const formattedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return `${apiUrl}${formattedEndpoint}`;
}

/**
 * Get the authentication headers for API requests
 *
 * @returns The headers object with authentication token
 */
export function getAuthHeaders(): Record<string, string> {
  let token = "";

  // Get the token from localStorage if we're in the browser
  if (typeof window !== "undefined") {
    token = localStorage.getItem("auth_token") || "";
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };

  // Only add Authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Create a full URL with query parameters
 *
 * @param endpoint - The API endpoint
 * @param params - Object containing query parameters
 * @returns The full URL with query parameters
 */
export function createUrlWithParams(
  endpoint: string,
  params: Record<string, string | number | boolean>
): string {
  const url = new URL(getApiUrl(endpoint));

  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  return url.toString();
}
