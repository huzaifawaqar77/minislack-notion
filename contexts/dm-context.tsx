"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { dmApi } from "@/lib/api";
import { useAuth } from "./auth-context";
import { useWebSocket } from "./websocket-context";
import { toast } from "sonner";

// Define types
export interface DMUser {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export interface DMChannel {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  other_user: DMUser;
  last_message?: {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
  };
  unread_count: number;
}

interface DMContextType {
  dmChannels: DMChannel[];
  isLoading: boolean;
  error: string | null;
  createOrGetDMChannel: (userId: string) => Promise<DMChannel>;
  markChannelAsRead: (channelId: string) => Promise<void>;
  refreshDMChannels: () => Promise<void>;
  setUnreadCount: (channelId: string, count: number) => void;
}

const DMContext = createContext<DMContextType | undefined>(undefined);

export function DMProvider({ children }: { children: React.ReactNode }) {
  const [dmChannels, setDMChannels] = useState<DMChannel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const { isConnected, subscribe, sendMessage } = useWebSocket();

  // Fetch DM channels when the component mounts
  useEffect(() => {
    if (isAuthenticated) {
      refreshDMChannels();
    }
  }, [isAuthenticated]);

  // Subscribe to WebSocket events for DM updates
  useEffect(() => {
    if (!isConnected || !user) return;

    // Subscribe to new message events
    const messageUnsubscribe = subscribe("message", (data) => {
      // Check if this is a DM message
      if (data.channel_id && data.is_direct) {
        // Update the unread count for the channel
        if (data.sender_id !== user.id) {
          setDMChannels((prev) => {
            // Check if the channel already exists in our state
            const existingChannel = prev.find(
              (channel) => channel.id === data.channel_id
            );

            if (existingChannel) {
              // Update existing channel
              return prev.map((channel) => {
                if (channel.id === data.channel_id) {
                  return {
                    ...channel,
                    unread_count: channel.unread_count + 1,
                    last_message: {
                      id: data.id,
                      content: data.content,
                      created_at: data.created_at,
                      user_id: data.sender_id,
                    },
                  };
                }
                return channel;
              });
            } else {
              // This is a new DM channel we don't have yet
              // Fetch the channel details and add it to our state
              console.log(
                "Received message for new DM channel, refreshing channels"
              );
              // Refresh channels to get the new one
              refreshDMChannels();
              return prev;
            }
          });
        }
      }
    });

    // Subscribe to new DM channel events
    const dmChannelCreatedUnsubscribe = subscribe(
      "dm_channel_created",
      (data) => {
        console.log("New DM channel created:", data);
        // Refresh channels to get the new one
        refreshDMChannels();
      }
    );

    return () => {
      messageUnsubscribe();
      dmChannelCreatedUnsubscribe();
    };
  }, [isConnected, user, subscribe]);

  // Refresh DM channels - memoized to prevent infinite loops
  const refreshDMChannels = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await dmApi.getDMChannels();
      setDMChannels(response.data || []);
    } catch (err) {
      console.error("Failed to fetch DM channels:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch DM channels"
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]); // Only recreate when authentication status changes

  // Create or get a DM channel - memoized to prevent infinite loops
  const createOrGetDMChannel = useCallback(
    async (userId: string): Promise<DMChannel> => {
      try {
        const response = await dmApi.createOrGetDMChannel(userId);

        // Check if this channel already exists in our state
        const existingChannelIndex = dmChannels.findIndex(
          (channel) => channel.id === response.data.id
        );

        if (existingChannelIndex >= 0) {
          // Update the existing channel
          const updatedChannels = [...dmChannels];
          updatedChannels[existingChannelIndex] = response.data;
          setDMChannels(updatedChannels);
        } else {
          // Add the new channel
          setDMChannels((prev) => [response.data, ...prev]);
        }

        return response.data;
      } catch (err) {
        console.error("Failed to create/get DM channel:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to create DM channel"
        );
        throw err;
      }
    },
    [dmChannels]
  );

  // Mark a channel as read - memoized to prevent infinite loops
  const markChannelAsRead = useCallback(
    async (channelId: string): Promise<void> => {
      try {
        await dmApi.markDMChannelAsRead(channelId);

        // Update the unread count in our state
        setDMChannels((prev) =>
          prev.map((channel) =>
            channel.id === channelId ? { ...channel, unread_count: 0 } : channel
          )
        );
      } catch (err) {
        console.error("Failed to mark channel as read:", err);
        // Don't show a toast here as it might be distracting
      }
    },
    []
  );

  // Update unread count for a channel - memoized to prevent infinite loops
  const setUnreadCount = useCallback((channelId: string, count: number) => {
    setDMChannels((prev) =>
      prev.map((channel) =>
        channel.id === channelId ? { ...channel, unread_count: count } : channel
      )
    );
  }, []);

  return (
    <DMContext.Provider
      value={{
        dmChannels,
        isLoading,
        error,
        createOrGetDMChannel,
        markChannelAsRead,
        refreshDMChannels,
        setUnreadCount,
      }}
    >
      {children}
    </DMContext.Provider>
  );
}

export function useDM() {
  const context = useContext(DMContext);
  if (context === undefined) {
    throw new Error("useDM must be used within a DMProvider");
  }
  return context;
}
