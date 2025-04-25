import axios from "axios";

// Get the API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies/authentication
});

// Add a request interceptor to include auth token if available
apiClient.interceptors.request.use(
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

// Add a response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors here (e.g., 401 Unauthorized, 403 Forbidden)
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // Handle unauthorized (e.g., redirect to login)
        console.error("Unauthorized access. Please log in.");
        // Redirect to login page
        if (typeof window !== "undefined") {
          // Clear auth token
          localStorage.removeItem("auth_token");
          // Redirect to login page with the current URL as the callback URL
          window.location.href = `/login?callbackUrl=${encodeURIComponent(
            window.location.pathname
          )}`;
        }
      } else if (status === 403) {
        console.error("Access forbidden.");
      } else if (status === 500) {
        console.error("Server error. Please try again later.");
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error(
        "No response received from server. Please check your connection."
      );
    } else {
      // Something happened in setting up the request
      console.error("Error setting up request:", error.message);
    }

    return Promise.reject(error);
  }
);

export { apiClient };
