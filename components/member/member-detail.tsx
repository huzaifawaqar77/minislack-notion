"use client";

import { useState } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { workspaceApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { MoreHorizontal, Mail, Shield, UserMinus } from "lucide-react";
import { DMButton } from "./dm-button";

interface MemberDetailProps {
  member: {
    membership_id: string;
    user_id: string;
    username: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    role: string;
    joined_at: string;
    status?: string;
  };
  onMemberUpdated: () => void;
}

export function MemberDetail({ member, onMemberUpdated }: MemberDetailProps) {
  const { activeWorkspace } = useWorkspace();
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleUpdateRole = async (newRole: string) => {
    if (!activeWorkspace) return;

    try {
      await workspaceApi.updateWorkspaceMemberRole(
        activeWorkspace.id,
        member.user_id,
        newRole
      );
      toast.success("Member role updated successfully");
      onMemberUpdated();
    } catch (error) {
      console.error("Failed to update member role:", error);
      toast.error("Failed to update member role");
    }
  };

  const handleRemoveMember = async () => {
    if (!activeWorkspace) return;

    setIsRemoving(true);
    try {
      await workspaceApi.removeWorkspaceMember(
        activeWorkspace.id,
        member.user_id
      );
      toast.success("Member removed successfully");
      setIsRemoveDialogOpen(false);
      onMemberUpdated();
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast.error("Failed to remove member");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage
            src={member.avatar_url || "/placeholder-user.jpg"}
            alt={member.username}
          />
          <AvatarFallback>
            {member.first_name?.charAt(0) || member.username.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">
              {member.first_name && member.last_name
                ? `${member.first_name} ${member.last_name}`
                : member.username}
            </h3>
            <Badge
              variant={
                member.role === "admin"
                  ? "default"
                  : member.role === "guest"
                  ? "outline"
                  : "secondary"
              }
            >
              {member.role}
            </Badge>
            <div
              className={`h-2 w-2 rounded-full ${
                member.status === "online"
                  ? "bg-green-500"
                  : member.status === "away"
                  ? "bg-yellow-500"
                  : member.status === "busy"
                  ? "bg-red-500"
                  : "bg-gray-300"
              }`}
              title={member.status || "offline"}
            />
          </div>
          <p className="text-sm text-muted-foreground">{member.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" title="Send Email">
          <Mail className="h-4 w-4" />
        </Button>
        <DMButton userId={member.user_id} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleUpdateRole("admin")}
              disabled={member.role === "admin"}
            >
              <Shield className="mr-2 h-4 w-4" />
              Make Admin
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleUpdateRole("member")}
              disabled={member.role === "member"}
            >
              <Shield className="mr-2 h-4 w-4" />
              Make Member
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleUpdateRole("guest")}
              disabled={member.role === "guest"}
            >
              <Shield className="mr-2 h-4 w-4" />
              Make Guest
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => setIsRemoveDialogOpen(true)}
            >
              <UserMinus className="mr-2 h-4 w-4" />
              Remove Member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-medium">
                {member.first_name && member.last_name
                  ? `${member.first_name} ${member.last_name}`
                  : member.username}
              </span>{" "}
              from this workspace? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRemoveDialogOpen(false)}
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <>
                  <span className="mr-2">Removing...</span>
                  <span className="animate-spin">⏳</span>
                </>
              ) : (
                "Remove Member"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
