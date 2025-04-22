"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDM } from "@/contexts/dm-context";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, MessageSquarePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function DMList() {
  const { dmChannels, isLoading, refreshDMChannels } = useDM();
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Refresh DM channels when the component mounts
  useEffect(() => {
    console.log("DMList: Refreshing DM channels");
    refreshDMChannels();
    // We're using refreshDMChannels in the dependency array because it's now memoized
    // and won't cause infinite loops
  }, [refreshDMChannels]);

  // Filter DM channels based on search query
  const filteredChannels = dmChannels.filter((channel) => {
    if (!searchQuery) return true;

    const otherUser = channel.other_user;
    const fullName = `${otherUser.first_name || ""} ${
      otherUser.last_name || ""
    }`.trim();

    return (
      otherUser.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Format the last message time
  const formatMessageTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Unknown time";
    }
  };

  // Handle clicking on a DM channel
  const handleChannelClick = (channelId: string) => {
    router.push(`/dashboard/dm/${channelId}`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Direct Messages</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/dm/new")}
            title="New Message"
          >
            <MessageSquarePlus className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search messages..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-32">
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "No conversations found"
                : "No direct messages yet"}
            </p>
            <Button
              variant="link"
              onClick={() => router.push("/dashboard/dm/new")}
              className="mt-2"
            >
              Start a conversation
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {filteredChannels.map((channel) => (
              <button
                key={channel.id}
                className={cn(
                  "w-full flex items-center p-3 hover:bg-accent/50 transition-colors",
                  "focus:outline-none focus:bg-accent/50 text-left"
                )}
                onClick={() => handleChannelClick(channel.id)}
              >
                <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
                  <AvatarImage
                    src={
                      channel.other_user.avatar_url || "/placeholder-user.jpg"
                    }
                    alt={channel.other_user.username || "User"}
                  />
                  <AvatarFallback>
                    {channel.other_user.first_name
                      ? channel.other_user.first_name.charAt(0)
                      : channel.other_user.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate">
                      {channel.other_user.first_name &&
                      channel.other_user.last_name
                        ? `${channel.other_user.first_name} ${channel.other_user.last_name}`
                        : channel.other_user.username}
                    </span>
                    {channel.last_message && (
                      <span className="text-xs text-muted-foreground">
                        {formatMessageTime(channel.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground truncate">
                      {channel.last_message
                        ? channel.last_message.user_id === user?.id
                          ? `You: ${channel.last_message.content}`
                          : channel.last_message.content
                        : "No messages yet"}
                    </p>
                    {channel.unread_count > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {channel.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
