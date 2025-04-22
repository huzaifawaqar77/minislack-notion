"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function OAuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider") || "OAuth";

  useEffect(() => {
    toast.error(`${provider} authentication failed. Please try again.`);
  }, [provider]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4 max-w-md text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h1 className="text-2xl font-bold">Authentication Failed</h1>
        <p className="text-muted-foreground">
          We couldn't authenticate you with {provider}. This could be due to a temporary issue or because you denied the permission request.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Button 
            variant="default" 
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => router.push("/login")}
          >
            Return to Login
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push("/")}
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}
