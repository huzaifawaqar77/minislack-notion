"use client";

import React, { useEffect, useState, useRef } from "react";
import { useProject } from "@/contexts/project-context";
import { useWorkspace } from "@/contexts/workspace-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import {
  PlusCircle,
  MoreVertical,
  Archive,
  Trash2,
  Edit,
  Users,
} from "lucide-react";
import Link from "next/link";
import { CreateProjectDialog } from "./create-project-dialog";
import { useRouter } from "next/navigation";

export function ProjectList() {
  const router = useRouter();
  const { activeWorkspace } = useWorkspace();
  const {
    projects,
    loading,
    error,
    fetchProjects,
    toggleArchiveProject,
    removeProject,
  } = useProject();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Projects are already fetched in the ProjectContext when activeWorkspace changes
  // No need to fetch them again here

  const filteredProjects = projects.filter(
    (project) => project.is_archived === showArchived
  );

  const handleArchiveProject = async (id: string, archive: boolean) => {
    await toggleArchiveProject(id, archive);
  };

  const handleDeleteProject = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      await removeProject(id);
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Projects</h2>
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        Error loading projects: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {showArchived ? "Archived Projects" : "Projects"}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? "Show Active Projects" : "Show Archived"}
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground">
            {showArchived
              ? "No archived projects found."
              : "No projects found. Create your first project to get started!"}
          </p>
          {!showArchived && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              {project.image_url && (
                <div className="h-32 overflow-hidden">
                  <img
                    src={project.image_url}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">
                    <Link
                      href={`/projects/${project.id}`}
                      className="hover:underline"
                    >
                      {project.name}
                    </Link>
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => router.push(`/projects/${project.id}`)}
                      >
                        <Edit className="mr-2 h-4 w-4" /> View Project
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/projects/${project.id}/settings`)
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit Project
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/projects/${project.id}/members`)
                        }
                      >
                        <Users className="mr-2 h-4 w-4" /> Manage Members
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          handleArchiveProject(project.id, !project.is_archived)
                        }
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        {project.is_archived ? "Unarchive" : "Archive"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>
                  {project.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex gap-2">
                  {project.is_public ? (
                    <Badge variant="outline">Public</Badge>
                  ) : (
                    <Badge variant="outline">Private</Badge>
                  )}
                  {project.is_archived && (
                    <Badge variant="secondary">Archived</Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                <div className="flex justify-between w-full">
                  <span>
                    Created{" "}
                    {formatDistanceToNow(new Date(project.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
