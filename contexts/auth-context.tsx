"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    credentials: {
      usernameOrEmail: string;
      password: string;
    },
    redirectTo?: string
  ) => Promise<void>;
  register: (
    userData: {
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      password: string;
    },
    redirectTo?: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if the user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if we have a token
        if (authApi.isAuthenticated()) {
          // Get the token
          const currentToken = authApi.getToken();
          setToken(currentToken);

          // Get user from localStorage
          const storedUser = authApi.getCurrentUser();
          if (storedUser) {
            setUser(storedUser);
          } else {
            // If we have a token but no user, verify the token
            const response = await authApi.verifyToken();
            if (response && response.user) {
              setUser(response.user);
            } else {
              // If token verification fails, clear auth state
              authApi.logout();
              setToken(null);
            }
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        authApi.logout();
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (
    credentials: {
      usernameOrEmail: string;
      password: string;
    },
    redirectTo?: string
  ) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      setUser(response.user);
      setToken(response.token);

      // Redirect to the specified URL or dashboard
      router.push(redirectTo || "/dashboard");
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    userData: {
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      password: string;
    },
    redirectTo?: string
  ) => {
    setIsLoading(true);
    try {
      await authApi.register(userData);

      // Redirect to login with the email prefilled and redirect parameter
      const loginRedirect = redirectTo
        ? `/login?email=${encodeURIComponent(
            userData.email
          )}&redirect=${encodeURIComponent(redirectTo)}`
        : `/login?email=${encodeURIComponent(userData.email)}`;

      router.push(loginRedirect);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setToken(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
