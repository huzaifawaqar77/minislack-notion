"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { workspaceApi } from "@/lib/api";

interface Invitation {
  id: string;
  email: string;
  workspace_id: string;
  workspace_name: string;
  invited_by: string;
  inviter_name: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

export default function InvitationsPage() {
  const { user } = useAuth();
  const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>([]);
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitations = async () => {
      setIsLoading(true);
      try {
        // Fetch invitations received by the user
        const receivedResponse = await fetch("/api/invitations/me");
        const receivedData = await receivedResponse.json();
        setReceivedInvitations(receivedData.data || []);

        // Fetch invitations sent by the user
        // This would typically be fetched per workspace, but for simplicity we'll combine them
        const sentResponse = await fetch("/api/invitations/sent");
        const sentData = await sentResponse.json();
        setSentInvitations(sentData.data || []);
      } catch (error) {
        console.error("Failed to fetch invitations:", error);
        toast.error("Failed to load invitations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  const handleAcceptInvitation = async (token: string) => {
    setIsProcessing(token);
    try {
      await fetch(`/api/invitations/${token}/accept`, {
        method: "POST",
      });
      
      // Update the local state
      setReceivedInvitations((prev) =>
        prev.map((inv) =>
          inv.id === token ? { ...inv, status: "accepted" } : inv
        )
      );
      
      toast.success("Invitation accepted successfully");
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      toast.error("Failed to accept invitation");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDeclineInvitation = async (token: string) => {
    setIsProcessing(token);
    try {
      await fetch(`/api/invitations/${token}/decline`, {
        method: "POST",
      });
      
      // Update the local state
      setReceivedInvitations((prev) =>
        prev.map((inv) =>
          inv.id === token ? { ...inv, status: "declined" } : inv
        )
      );
      
      toast.success("Invitation declined");
    } catch (error) {
      console.error("Failed to decline invitation:", error);
      toast.error("Failed to decline invitation");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleResendInvitation = async (id: string) => {
    setIsProcessing(id);
    try {
      await fetch(`/api/invitations/${id}/resend`, {
        method: "POST",
      });
      
      toast.success("Invitation resent successfully");
    } catch (error) {
      console.error("Failed to resend invitation:", error);
      toast.error("Failed to resend invitation");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCancelInvitation = async (id: string) => {
    setIsProcessing(id);
    try {
      await fetch(`/api/invitations/${id}`, {
        method: "DELETE",
      });
      
      // Update the local state
      setSentInvitations((prev) => prev.filter((inv) => inv.id !== id));
      
      toast.success("Invitation cancelled");
    } catch (error) {
      console.error("Failed to cancel invitation:", error);
      toast.error("Failed to cancel invitation");
    } finally {
      setIsProcessing(null);
    }
  };

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
        <h2 className="text-3xl font-bold tracking-tight">Invitations</h2>
        <p className="text-muted-foreground">
          Manage your workspace invitations
        </p>
      </div>

      <Tabs defaultValue="received" className="space-y-4">
        <TabsList>
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {receivedInvitations.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Invitations</CardTitle>
                <CardDescription>
                  You don't have any pending invitations
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            receivedInvitations.map((invitation) => (
              <Card key={invitation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{invitation.workspace_name}</CardTitle>
                    <Badge
                      variant={
                        invitation.status === "pending"
                          ? "outline"
                          : invitation.status === "accepted"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {invitation.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Invited by {invitation.inviter_name} on{" "}
                    {new Date(invitation.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    You've been invited to join this workspace as a{" "}
                    <strong>{invitation.role}</strong>
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This invitation expires on{" "}
                    {new Date(invitation.expires_at).toLocaleDateString()}
                  </p>
                </CardContent>
                {invitation.status === "pending" && (
                  <CardFooter className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleDeclineInvitation(invitation.id)}
                      disabled={isProcessing === invitation.id}
                    >
                      {isProcessing === invitation.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <X className="mr-2 h-4 w-4" />
                      )}
                      Decline
                    </Button>
                    <Button
                      onClick={() => handleAcceptInvitation(invitation.id)}
                      disabled={isProcessing === invitation.id}
                    >
                      {isProcessing === invitation.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      Accept
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {sentInvitations.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Sent Invitations</CardTitle>
                <CardDescription>
                  You haven't sent any invitations yet
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            sentInvitations.map((invitation) => (
              <Card key={invitation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{invitation.workspace_name}</CardTitle>
                    <Badge
                      variant={
                        invitation.status === "pending"
                          ? "outline"
                          : invitation.status === "accepted"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {invitation.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Sent to {invitation.email} on{" "}
                    {new Date(invitation.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    You've invited this user to join as a{" "}
                    <strong>{invitation.role}</strong>
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This invitation expires on{" "}
                    {new Date(invitation.expires_at).toLocaleDateString()}
                  </p>
                </CardContent>
                {invitation.status === "pending" && (
                  <CardFooter className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleCancelInvitation(invitation.id)}
                      disabled={isProcessing === invitation.id}
                    >
                      {isProcessing === invitation.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <X className="mr-2 h-4 w-4" />
                      )}
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleResendInvitation(invitation.id)}
                      disabled={isProcessing === invitation.id}
                    >
                      {isProcessing === invitation.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      Resend
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
