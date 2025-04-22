"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import webSocketService from "@/lib/websocket";

interface WebSocketContextType {
  isConnected: boolean;
  onlineUsers: string[];
  onlineCount: number;
  sendMessage: (message: any) => void;
  subscribe: (
    eventType: string,
    callback: (message: any) => void
  ) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(0);

  useEffect(() => {
    if (token) {
      // Connect to WebSocket when user is authenticated
      webSocketService.connect(token);

      // Subscribe to connection status changes
      const statusUnsubscribe = webSocketService.subscribeToStatus((status) => {
        setIsConnected(status === "connected");
      });

      // Subscribe to global presence updates
      const presenceUnsubscribe = webSocketService.subscribe(
        "global:presence",
        (data) => {
          console.log("Global presence update:", data);
          setOnlineUsers(data.onlineUsers || []);
          setOnlineCount(data.count || 0);
        }
      );

      return () => {
        statusUnsubscribe();
        presenceUnsubscribe();
        webSocketService.disconnect();
      };
    }
  }, [token]);

  const sendMessage = (message: any) => {
    webSocketService.send(message);
  };

  const subscribe = (eventType: string, callback: (message: any) => void) => {
    return webSocketService.subscribe(eventType, callback);
  };

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        onlineUsers,
        onlineCount,
        sendMessage,
        subscribe,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
