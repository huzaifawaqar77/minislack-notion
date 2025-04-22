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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { InviteMemberDialog } from "@/components/workspace/invite-member-dialog";
import { MemberDetail } from "./member-detail";

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
  status?: string;
}

export function MemberList() {
  const { activeWorkspace } = useWorkspace();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState<WorkspaceMember[]>([]);
  const [activeTab, setActiveTab] = useState("all");

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
      let filtered = members;
      
      // Filter by search query
      if (searchQuery) {
        filtered = filtered.filter(
          (member) =>
            member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `${member.first_name || ""} ${member.last_name || ""}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
      }
      
      // Filter by role
      if (activeTab !== "all") {
        filtered = filtered.filter((member) => member.role === activeTab);
      }
      
      setFilteredMembers(filtered);
    }
  }, [members, searchQuery, activeTab]);

  if (!activeWorkspace) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Workspace</CardTitle>
          <CardDescription>
            Select a workspace from the sidebar to view its members.
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
              View and manage all members in your workspace
            </CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Members</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
            <TabsTrigger value="member">Members</TabsTrigger>
            <TabsTrigger value="guest">Guests</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex h-[200px] flex-col items-center justify-center space-y-2 rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? `No members matching "${searchQuery}"`
                : activeTab !== "all"
                ? `No ${activeTab}s in this workspace yet`
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
          <div className="space-y-4">
            {filteredMembers.map((member) => (
              <MemberDetail
                key={member.membership_id}
                member={member}
                onMemberUpdated={fetchMembers}
              />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Total members: {members.length}
        </div>
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
      </CardFooter>
    </Card>
  );
}
