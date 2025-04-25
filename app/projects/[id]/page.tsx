"use client";

import React, { useEffect, useState, useRef } from "react";
import { useProject } from "@/contexts/project-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskBoard } from "@/components/projects/task-board";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Settings,
  Users,
  Archive,
  Trash2,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProjectPage({ params }: { params: { id: string } }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const projectId = unwrappedParams.id;

  const router = useRouter();
  const {
    activeProject,
    loading,
    error,
    fetchProject,
    fetchProjectMembers,
    projectMembers,
    toggleArchiveProject,
    removeProject,
  } = useProject();
  const [activeTab, setActiveTab] = useState("tasks");

  // Use a ref to track if we've already fetched the data
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch data if we haven't already and we have a projectId
    if (!dataFetchedRef.current && projectId) {
      fetchProject(projectId);
      fetchProjectMembers(projectId);
      dataFetchedRef.current = true;
    }
  }, [projectId, fetchProject, fetchProjectMembers]);

  const handleArchiveProject = async () => {
    if (!activeProject) return;

    await toggleArchiveProject(activeProject.id, !activeProject.is_archived);
  };

  const handleDeleteProject = async () => {
    if (!activeProject) return;

    if (
      window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      const success = await removeProject(activeProject.id);
      if (success) {
        router.push("/projects");
      }
    }
  };

  if (loading && !activeProject) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6">
        <div className="p-4 bg-red-50 text-red-500 rounded-md">
          Error loading project: {error}
        </div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/projects")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="container py-6">
        <div className="p-4 bg-yellow-50 text-yellow-500 rounded-md">
          Project not found
        </div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/projects")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/projects")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{activeProject.name}</h1>
            <p className="text-sm text-muted-foreground">
              {activeProject.description || "No description provided"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {projectMembers.slice(0, 3).map((member) => (
              <Avatar
                key={member.user_id}
                className="h-8 w-8 border-2 border-background"
              >
                <AvatarImage
                  src={member.avatar_url || ""}
                  alt={member.username}
                />
                <AvatarFallback>
                  {member.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {projectMembers.length > 3 && (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                +{projectMembers.length - 3}
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/projects/${activeProject.id}/settings`)
                }
              >
                <Edit className="mr-2 h-4 w-4" /> Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/projects/${activeProject.id}/members`)
                }
              >
                <Users className="mr-2 h-4 w-4" /> Manage Members
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleArchiveProject}>
                <Archive className="mr-2 h-4 w-4" />
                {activeProject.is_archived ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onClick={handleDeleteProject}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {activeProject.is_public ? (
          <Badge variant="outline">Public</Badge>
        ) : (
          <Badge variant="outline">Private</Badge>
        )}
        {activeProject.is_archived && (
          <Badge variant="secondary">Archived</Badge>
        )}
        <span className="text-sm text-muted-foreground">
          Created{" "}
          {formatDistanceToNow(new Date(activeProject.created_at), {
            addSuffix: true,
          })}
        </span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="mt-6">
          <TaskBoard projectId={activeProject.id} />
        </TabsContent>
        <TabsContent value="members" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Project Members</h2>
              <Button
                onClick={() =>
                  router.push(`/projects/${activeProject.id}/members`)
                }
              >
                <Users className="mr-2 h-4 w-4" /> Manage Members
              </Button>
            </div>
            <div className="space-y-2">
              {projectMembers.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between p-3 bg-card rounded-md border"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={member.avatar_url || ""}
                        alt={member.username}
                      />
                      <AvatarFallback>
                        {member.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {member.first_name && member.last_name
                          ? `${member.first_name} ${member.last_name}`
                          : member.username}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <Badge>{member.role}</Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Project Settings</h2>
              <Button
                onClick={() =>
                  router.push(`/projects/${activeProject.id}/settings`)
                }
              >
                <Settings className="mr-2 h-4 w-4" /> Edit Settings
              </Button>
            </div>
            <div className="space-y-4 p-4 bg-card rounded-md border">
              <p>Configure project settings, permissions, and other options.</p>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/projects/${activeProject.id}/settings`)
                }
              >
                Go to Settings
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
