"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { WorkspaceMembers } from "@/components/workspace/workspace-members";
import { Loader2, PlusCircle, Settings, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function WorkspaceSettingsPage() {
  const { workspaces, activeWorkspace, isLoading } = useWorkspace();
  const [isUpdating, setIsUpdating] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Workspace Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your workspaces and their settings
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="all-workspaces">All Workspaces</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          {activeWorkspace ? (
            <Card>
              <CardHeader>
                <CardTitle>Workspace Information</CardTitle>
                <CardDescription>
                  Update your workspace details and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workspace Name</Label>
                  <Input
                    id="name"
                    defaultValue={activeWorkspace.name}
                    disabled={isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Workspace Slug</Label>
                  <Input
                    id="slug"
                    defaultValue={activeWorkspace.slug}
                    disabled={true}
                  />
                  <p className="text-xs text-muted-foreground">
                    The slug is used in URLs and cannot be changed
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="visibility"
                      defaultChecked={activeWorkspace.is_public}
                      disabled={isUpdating}
                    />
                    <Label htmlFor="visibility" className="cursor-pointer">
                      Public workspace
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Public workspaces can be discovered by anyone in your
                    organization
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Active Workspace</CardTitle>
                <CardDescription>
                  Select a workspace from the sidebar or create a new one
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <CreateWorkspaceDialog
                  trigger={
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Workspace
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <WorkspaceMembers />
        </TabsContent>

        <TabsContent value="all-workspaces" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Your Workspaces</h3>
            <CreateWorkspaceDialog
              trigger={
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Workspace
                </Button>
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <Card key={workspace.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{workspace.name}</CardTitle>
                  <CardDescription>
                    Created on{" "}
                    {new Date(workspace.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">
                    {workspace.is_public ? "Public" : "Private"} workspace
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Manage
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {workspaces.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No workspaces found. Create one to get started.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
