"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useDM } from "@/contexts/dm-context";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, MessageSquarePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DMSidebarProps {
  isCollapsed?: boolean;
}

export function DMSidebar({ isCollapsed = false }: DMSidebarProps) {
  const { dmChannels, isLoading, refreshDMChannels } = useDM();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  // Refresh DM channels when the component mounts
  useEffect(() => {
    console.log("DMSidebar: Refreshing DM channels");
    refreshDMChannels();
    // We're using refreshDMChannels in the dependency array because it's now memoized
    // and won't cause infinite loops
  }, [refreshDMChannels]);

  // Filter DM channels based on search query
  const filteredChannels = dmChannels.filter((channel) => {
    if (!searchQuery) return true;

    const otherUser = channel.other_user;

    console.log("================CHANNEL OTHER USER===================");
    console.log(otherUser);

    const fullName = `${otherUser.first_name || ""} ${
      otherUser.last_name || ""
    }`.trim();

    return (
      otherUser.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div>
      <div
        className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "justify-between py-1"
        )}
      >
        {!isCollapsed && (
          <h2 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
            Direct Messages
          </h2>
        )}
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-sidebar-foreground/70 hover:text-sidebar-foreground"
            onClick={() => router.push("/dashboard/dm/new")}
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span className="sr-only">New Message</span>
          </Button>
        )}
      </div>

      <div className="mt-2">
        {isLoading ? (
          <div className="flex justify-center items-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-sidebar-foreground/70" />
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="py-1 text-xs text-sidebar-foreground/70 text-center">
            No direct messages
          </div>
        ) : (
          <div className="space-y-1">
            {filteredChannels.map((channel) => (
              <Link key={channel.id} href={`/dashboard/dm/${channel.id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "font-normal transition-all",
                    pathname === `/dashboard/dm/${channel.id}`
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    isCollapsed
                      ? "h-8 w-8 p-0 mx-auto justify-center"
                      : "w-full justify-start px-2 py-1.5 h-auto"
                  )}
                >
                  {isCollapsed ? (
                    <div className="relative">
                      <Avatar className="h-5 w-5">
                        <AvatarImage
                          src={
                            process.env.NEXT_PUBLIC_API_URL +
                              "/" +
                              channel.other_user.avatar_url?.split(
                                "/public"
                              )[1] || "/placeholder-user.jpg"
                          }
                          alt={channel.other_user.username || "User"}
                        />
                        <AvatarFallback className="text-xs bg-accent/80 text-accent-foreground">
                          {channel.other_user.first_name
                            ? channel.other_user.first_name.charAt(0)
                            : channel.other_user.username?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {channel.unread_count > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 text-[10px] h-4 min-w-4 flex items-center justify-center p-0"
                        >
                          {channel.unread_count}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center w-full">
                      <Avatar className="h-5 w-5 mr-2">
                        <AvatarImage
                          src={
                            process.env.NEXT_PUBLIC_API_URL +
                              "/" +
                              channel.other_user.avatar_url?.split(
                                "/public"
                              )[1] || "/placeholder-user.jpg"
                          }
                          alt={channel.other_user.username || "User"}
                        />
                        <AvatarFallback className="text-xs bg-accent/80 text-accent-foreground">
                          {channel.other_user.first_name
                            ? channel.other_user.first_name.charAt(0)
                            : channel.other_user.username?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-sm">
                        {channel.other_user.first_name ||
                          channel.other_user.username}
                      </span>
                      {channel.unread_count > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-auto text-xs h-5 min-w-5"
                        >
                          {channel.unread_count}
                        </Badge>
                      )}
                    </div>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
