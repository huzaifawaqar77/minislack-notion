"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useWorkspace } from "./workspace-context";
import { channelApi } from "@/lib/api";
import { toast } from "sonner";

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  is_private: boolean;
  workspace_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ChannelContextType {
  channels: Channel[];
  activeChannel: Channel | null;
  isLoading: boolean;
  error: string | null;
  setActiveChannel: (channel: Channel) => void;
  createChannel: (data: { name: string; description?: string; isPrivate?: boolean }) => Promise<Channel>;
  fetchChannels: () => Promise<void>;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export function ChannelProvider({ children }: { children: React.ReactNode }) {
  const { activeWorkspace } = useWorkspace();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChannels = async () => {
    if (!activeWorkspace) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await channelApi.getChannels(activeWorkspace.id);
      const fetchedChannels = response.data || [];
      
      setChannels(fetchedChannels);
      
      // Set active channel to the first one if none is selected
      if (fetchedChannels.length > 0 && !activeChannel) {
        // Try to get the last active channel from localStorage
        const lastActiveId = localStorage.getItem("activeChannelId");
        const lastActive = lastActiveId 
          ? fetchedChannels.find(c => c.id === lastActiveId)
          : null;
          
        setActiveChannel(lastActive || fetchedChannels[0]);
      }
    } catch (err) {
      console.error("Error fetching channels:", err);
      setError("Failed to load channels");
      toast.error("Failed to load channels");
    } finally {
      setIsLoading(false);
    }
  };

  const createChannel = async (data: { name: string; description?: string; isPrivate?: boolean }): Promise<Channel> => {
    if (!activeWorkspace) {
      throw new Error("No active workspace selected");
    }
    
    try {
      const response = await channelApi.createChannel(activeWorkspace.id, data);
      const newChannel = response.data;
      
      setChannels(prev => [...prev, newChannel]);
      toast.success(`Channel #${data.name} created successfully`);
      
      return newChannel;
    } catch (err) {
      console.error("Error creating channel:", err);
      toast.error("Failed to create channel");
      throw err;
    }
  };

  const handleSetActiveChannel = (channel: Channel) => {
    setActiveChannel(channel);
    localStorage.setItem("activeChannelId", channel.id);
  };

  // Fetch channels when the active workspace changes
  useEffect(() => {
    if (activeWorkspace) {
      fetchChannels();
    } else {
      setChannels([]);
      setActiveChannel(null);
    }
  }, [activeWorkspace]);

  return (
    <ChannelContext.Provider
      value={{
        channels,
        activeChannel,
        isLoading,
        error,
        setActiveChannel: handleSetActiveChannel,
        createChannel,
        fetchChannels,
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
}

export function useChannel() {
  const context = useContext(ChannelContext);
  if (context === undefined) {
    throw new Error("useChannel must be used within a ChannelProvider");
  }
  return context;
}
