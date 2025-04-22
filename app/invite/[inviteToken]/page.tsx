"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function InviteRedirectPage({
  params,
}: {
  params: { inviteToken: string };
}) {
  const router = useRouter();
  const token = params.inviteToken;

  useEffect(() => {
    if (token) {
      console.log("Redirecting to invitation acceptance page with token:", token);
      router.push(`/invitations/accept?token=${encodeURIComponent(token)}`);
    }
  }, [token, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Redirecting to invitation page...</p>
    </div>
  );
}
