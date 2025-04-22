"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function OAuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error("Authentication failed. No token received.");
      router.push("/login");
      return;
    }

    // Store the token in localStorage
    localStorage.setItem("auth_token", token);

    // Also set a cookie for server-side middleware
    document.cookie = `auth_token=${token}; path=/; max-age=2592000; SameSite=Strict; secure`; // 30 days

    // Get user data from the token
    const fetchUserData = async () => {
      try {
        // Decode the JWT token to get the user data
        // JWT tokens are in the format: header.payload.signature
        const payload = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payload));

        // Create a user object from the token payload
        const user = {
          id: decodedPayload.id,
          email: decodedPayload.email,
          username: decodedPayload.username,
        };

        // Store the user data
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Successfully logged in!");
        router.push("/dashboard");
      } catch (error) {
        console.error("Error processing token:", error);
        toast.error("Failed to process authentication. Please try again.");
        router.push("/login");
      }
    };

    fetchUserData();
  }, [token, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
        <h1 className="text-2xl font-bold">Logging you in...</h1>
        <p className="text-muted-foreground">
          Please wait while we complete the authentication process.
        </p>
      </div>
    </div>
  );
}
