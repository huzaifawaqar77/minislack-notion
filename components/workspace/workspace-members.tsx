"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { workspaceApi } from "@/lib/api";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import { Loader2, MoreHorizontal, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { InviteMemberDialog } from "./invite-member-dialog";

interface WorkspaceMember {
  membership_id: string;
  user_id: string;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: string;
  joined_at: string;
}

export function WorkspaceMembers() {
  const { activeWorkspace } = useWorkspace();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState<WorkspaceMember[]>([]);

  const fetchMembers = async () => {
    if (!activeWorkspace) return;

    setIsLoading(true);
    try {
      const response = await workspaceApi.getWorkspaceMembers(activeWorkspace.id);
      setMembers(response.data || []);
    } catch (error) {
      console.error("Failed to fetch workspace members:", error);
      toast.error("Failed to load workspace members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [activeWorkspace]);

  useEffect(() => {
    if (members) {
      setFilteredMembers(
        members.filter(
          (member) =>
            member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `${member.first_name || ""} ${member.last_name || ""}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [members, searchQuery]);

  const handleRemoveMember = async (memberId: string, userId: string) => {
    if (!activeWorkspace) return;

    try {
      await workspaceApi.removeWorkspaceMember(activeWorkspace.id, userId);
      setMembers(members.filter((member) => member.user_id !== userId));
      toast.success("Member removed successfully");
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast.error("Failed to remove member");
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!activeWorkspace) return;

    try {
      await workspaceApi.updateWorkspaceMemberRole(activeWorkspace.id, userId, newRole);
      setMembers(
        members.map((member) =>
          member.user_id === userId ? { ...member, role: newRole } : member
        )
      );
      toast.success("Member role updated successfully");
    } catch (error) {
      console.error("Failed to update member role:", error);
      toast.error("Failed to update member role");
    }
  };

  if (!activeWorkspace) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Workspace</CardTitle>
          <CardDescription>
            Select a workspace from the sidebar to manage its members.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <CardTitle>Workspace Members</CardTitle>
            <CardDescription>
              Manage members and their permissions in {activeWorkspace.name}
            </CardDescription>
          </div>
          <InviteMemberDialog
            workspaceId={activeWorkspace.id}
            onMemberInvited={fetchMembers}
            trigger={
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex h-[200px] flex-col items-center justify-center space-y-2 rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? `No members matching "${searchQuery}"`
                : "No members in this workspace yet"}
            </p>
            <InviteMemberDialog
              workspaceId={activeWorkspace.id}
              onMemberInvited={fetchMembers}
              trigger={
                <Button variant="outline" size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              }
            />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.membership_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={member.avatar_url || "/placeholder-user.jpg"}
                            alt={member.username}
                          />
                          <AvatarFallback>
                            {member.first_name?.charAt(0) ||
                              member.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {member.first_name && member.last_name
                              ? `${member.first_name} ${member.last_name}`
                              : member.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.role === "admin"
                            ? "default"
                            : member.role === "member"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(member.joined_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleUpdateRole(member.user_id, "admin")}
                            disabled={member.role === "admin"}
                          >
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateRole(member.user_id, "member")}
                            disabled={member.role === "member"}
                          >
                            Make Member
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              handleRemoveMember(member.membership_id, member.user_id)
                            }
                          >
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Total members: {members.length}
        </div>
      </CardFooter>
    </Card>
  );
}
