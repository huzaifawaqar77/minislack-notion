"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { dmApi } from "@/lib/api";
import { toast } from "sonner";

interface DMButtonProps {
  userId: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

export function DMButton({
  userId,
  variant = "ghost",
  size = "icon",
  className = "",
  showText = false,
}: DMButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      // Create or get a DM channel with this user
      const response = await dmApi.createOrGetDMChannel(userId);
      
      // Navigate to the DM channel
      router.push(`/dashboard/dm/${response.data.id}`);
    } catch (error) {
      console.error("Failed to create DM channel:", error);
      toast.error("Failed to start conversation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isLoading}
      title="Send Direct Message"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <MessageSquare className="h-4 w-4" />
          {showText && <span className="ml-2">Message</span>}
        </>
      )}
    </Button>
  );
}
