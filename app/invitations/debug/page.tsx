"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import { Loader2 } from "lucide-react";

export default function InvitationDebugPage() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string>(searchParams.get("token") || "");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchInvitation = async () => {
    if (!token) {
      setError("Please enter a token");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Fetching invitation with token:", token);
      const response = await fetch(`/api/invitations/${token}`);
      const data = await response.json();
      console.log("Invitation response:", data);

      setResult(data);
    } catch (error) {
      console.error("Failed to fetch invitation:", error);
      setError("Failed to load invitation details");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch if token is in URL
  useEffect(() => {
    if (token) {
      handleFetchInvitation();
    }
  }, []);

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Invitation Debug Tool</CardTitle>
          <CardDescription>
            Test invitation tokens to diagnose issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter invitation token"
              className="flex-1"
            />
            <Button onClick={handleFetchInvitation} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Test Token"
              )}
            </Button>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="rounded-md border p-4">
              <h3 className="mb-2 font-semibold">API Response:</h3>
              <pre className="overflow-auto rounded-md bg-gray-100 p-2 text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="rounded-md bg-blue-50 p-4 text-blue-700">
            <h3 className="mb-2 font-semibold">Environment Variables:</h3>
            <p>
              NEXT_PUBLIC_API_URL:{" "}
              {process.env.NEXT_PUBLIC_API_URL || "Not set"}
            </p>
            <p className="mt-2 text-xs">
              Note: The backend should be using FRONTEND_URL for invitation
              links, not APP_URL.
            </p>
          </div>

          <div className="rounded-md bg-yellow-50 p-4 text-yellow-700">
            <h3 className="mb-2 font-semibold">Troubleshooting:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                Check that the backend's <code>config.env</code> file has{" "}
                <code>FRONTEND_URL=http://localhost:3000</code>
              </li>
              <li>
                Restart the backend server after making changes to environment
                variables
              </li>
              <li>
                Verify that invitation emails are using the frontend URL (port
                3000), not the backend URL (port 3001)
              </li>
              <li>
                Try checking the token directly in the backend API:{" "}
                {token && (
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/invitations/${token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Check token in backend
                  </a>
                )}
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            This tool is for debugging purposes only.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
