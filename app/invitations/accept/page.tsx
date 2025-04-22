"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { Loader2, Check, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";

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

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Get token from URL and ensure it's properly decoded
  const rawToken = searchParams.get("token");
  const token = rawToken ? decodeURIComponent(rawToken) : null;

  console.log("Raw token from URL:", rawToken);
  console.log("Decoded token:", token);
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch invitation details
  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError("Invalid invitation link");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching invitation with token:", token);

        // Try direct API call to backend if frontend API fails
        let data;
        let response;

        try {
          // First try the frontend API route
          response = await fetch(
            `/api/invitations/${encodeURIComponent(token)}_token`
          );
          data = await response.json();
          console.log("Frontend API response:", data);
        } catch (frontendError) {
          console.error("Frontend API failed:", frontendError);

          // If frontend API fails, try direct backend call
          const backendUrl = `${
            process.env.NEXT_PUBLIC_API_URL
          }/invitations/${encodeURIComponent(token)}`;
          console.log("Trying direct backend call:", backendUrl);

          response = await fetch(backendUrl);
          data = await response.json();
          console.log("Direct backend response:", data);
        }

        if (data.status === "error") {
          setError(data.message || "Invitation not found or expired");
        } else {
          setInvitation(data.data);
        }
      } catch (error) {
        console.error("All invitation fetch attempts failed:", error);
        setError(
          "Failed to load invitation details. Please try again or contact support."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!token) return;

    setIsProcessing(true);
    try {
      console.log("Accepting invitation with token:", token);

      // Try frontend API first, then direct backend call if that fails
      let data;

      try {
        const response = await fetch(
          `/api/invitations/${encodeURIComponent(token)}_token/accept`,
          {
            method: "POST",
          }
        );

        data = await response.json();
        console.log("Frontend accept API response:", data);
      } catch (frontendError) {
        console.error("Frontend accept API failed:", frontendError);

        // If frontend API fails, try direct backend call with auth token
        const authToken = localStorage.getItem("auth_token");
        if (!authToken) {
          throw new Error("No authentication token found");
        }

        const backendUrl = `${
          process.env.NEXT_PUBLIC_API_URL
        }/invitations/${encodeURIComponent(token)}/accept`;
        console.log("Trying direct backend accept call:", backendUrl);

        const backendResponse = await fetch(backendUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        data = await backendResponse.json();
        console.log("Direct backend accept response:", data);
      }

      if (data.status === "error") {
        toast.error(data.message || "Failed to accept invitation");
      } else {
        toast.success("Invitation accepted successfully");
        // Redirect to dashboard
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("All accept invitation attempts failed:", error);
      toast.error(
        "Failed to accept invitation. Please try again or contact support."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineInvitation = async () => {
    if (!token) return;

    setIsProcessing(true);
    try {
      console.log("Declining invitation with token:", token);

      // Try frontend API first, then direct backend call if that fails
      let data;

      try {
        const response = await fetch(
          `/api/invitations/${encodeURIComponent(token)}_token/decline`,
          {
            method: "POST",
          }
        );

        data = await response.json();
        console.log("Frontend decline API response:", data);
      } catch (frontendError) {
        console.error("Frontend decline API failed:", frontendError);

        // If frontend API fails, try direct backend call with auth token
        const authToken = localStorage.getItem("auth_token");
        if (!authToken) {
          throw new Error("No authentication token found");
        }

        const backendUrl = `${
          process.env.NEXT_PUBLIC_API_URL
        }/invitations/${encodeURIComponent(token)}/decline`;
        console.log("Trying direct backend decline call:", backendUrl);

        const backendResponse = await fetch(backendUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        data = await backendResponse.json();
        console.log("Direct backend decline response:", data);
      }

      if (data.status === "error") {
        toast.error(data.message || "Failed to decline invitation");
      } else {
        toast.success("Invitation declined");
        // Redirect to login
        router.push("/login");
      }
    } catch (error) {
      console.error("All decline invitation attempts failed:", error);
      toast.error(
        "Failed to decline invitation. Please try again or contact support."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading invitation...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-500">
              Invitation Error
            </CardTitle>
            <CardDescription className="text-center">
              We couldn't process your invitation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Not authenticated - show login/register options
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="text-center">You've Been Invited!</CardTitle>
            <CardDescription className="text-center">
              {invitation?.inviter_name} has invited you to join{" "}
              {invitation?.workspace_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              To accept this invitation, you need to sign in or create an
              account with <strong>{invitation?.email}</strong>.
            </p>
            <div className="flex flex-col space-y-2">
              <Link
                href={`/login?email=${encodeURIComponent(
                  invitation?.email || ""
                )}&redirect=${encodeURIComponent(
                  `/invitations/accept?token=${token}`
                )}`}
              >
                <Button className="w-full">
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link
                href={`/register?email=${encodeURIComponent(
                  invitation?.email || ""
                )}&redirect=${encodeURIComponent(
                  `/invitations/accept?token=${token}`
                )}`}
              >
                <Button variant="outline" className="w-full">
                  Create an account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if the invitation email matches the logged-in user's email
  if (user?.email !== invitation?.email) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-yellow-500">
              Email Mismatch
            </CardTitle>
            <CardDescription className="text-center">
              This invitation was sent to a different email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This invitation was sent to <strong>{invitation?.email}</strong>,
              but you're logged in as <strong>{user?.email}</strong>.
            </p>
            <p className="mt-4">
              Please log out and sign in with the correct email address, or ask
              for a new invitation to be sent to your current email.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/logout">
              <Button>Log Out</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Authenticated and email matches - show accept/decline options
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Workspace Invitation</CardTitle>
          <CardDescription className="text-center">
            {invitation?.inviter_name} has invited you to join{" "}
            {invitation?.workspace_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            You've been invited to join this workspace as a{" "}
            <strong>{invitation?.role}</strong>.
          </p>
          {invitation?.status !== "pending" && (
            <p className="mt-4 text-yellow-500">
              Note: You've already {invitation?.status} this invitation.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleDeclineInvitation}
            disabled={isProcessing || invitation?.status !== "pending"}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <X className="mr-2 h-4 w-4" />
            )}
            Decline
          </Button>
          <Button
            onClick={handleAcceptInvitation}
            disabled={isProcessing || invitation?.status !== "pending"}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Accept
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
