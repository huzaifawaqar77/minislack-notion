"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth-context";
import api, { workspaceApi } from "@/lib/api";
import { toast } from "sonner";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  organization_id?: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoading: boolean;
  error: string | null;
  setActiveWorkspace: (workspace: Workspace) => void;
  createWorkspace: (name: string) => Promise<Workspace>;
  fetchWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use the workspace API service
      const response = await workspaceApi.getWorkspaces();
      const fetchedWorkspaces = response.data || [];

      setWorkspaces(fetchedWorkspaces);

      // Set active workspace to the first one if none is selected
      if (fetchedWorkspaces.length > 0 && !activeWorkspace) {
        // Try to get the last active workspace from localStorage
        const lastActiveId = localStorage.getItem("activeWorkspaceId");
        const lastActive = lastActiveId
          ? fetchedWorkspaces.find((w) => w.id === lastActiveId)
          : null;

        setActiveWorkspace(lastActive || fetchedWorkspaces[0]);
      }
    } catch (err) {
      console.error("Error fetching workspaces:", err);
      setError("Failed to load workspaces");
      toast.error("Failed to load workspaces");
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkspace = async (name: string): Promise<Workspace> => {
    try {
      console.log("Creating workspace with name:", name);
      // Use the workspace API service
      const response = await workspaceApi.createWorkspace(name);
      console.log("Workspace creation response:", response);
      const newWorkspace = response.data;

      setWorkspaces((prev) => [...prev, newWorkspace]);
      toast.success(`Workspace "${name}" created successfully`);

      return newWorkspace;
    } catch (err) {
      console.error("Error creating workspace:", err);
      toast.error("Failed to create workspace");
      throw err;
    }
  };

  const handleSetActiveWorkspace = (workspace: Workspace) => {
    setActiveWorkspace(workspace);
    localStorage.setItem("activeWorkspaceId", workspace.id);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkspaces();
    }
  }, [isAuthenticated]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        isLoading,
        error,
        setActiveWorkspace: handleSetActiveWorkspace,
        createWorkspace,
        fetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
