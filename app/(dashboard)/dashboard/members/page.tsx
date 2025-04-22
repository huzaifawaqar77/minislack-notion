"use client";

import { useWorkspace } from "@/contexts/workspace-context";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { InviteMemberDialog } from "@/components/workspace/invite-member-dialog";
import { MemberList } from "@/components/member/member-list";

export default function MembersPage() {
  const { activeWorkspace } = useWorkspace();

  return (
    <div className="flex-1 space-y-4">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Members</h2>
          {activeWorkspace && (
            <p className="text-sm text-muted-foreground">
              Manage members in {activeWorkspace.name}
            </p>
          )}
        </div>
        {activeWorkspace && (
          <InviteMemberDialog
            workspaceId={activeWorkspace.id}
            trigger={
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            }
          />
        )}
      </div>

      <MemberList />
    </div>
  );
}
