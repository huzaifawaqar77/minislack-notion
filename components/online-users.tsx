import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWebSocket } from "@/contexts/websocket-context";
import { User } from "@/types/user";
import { userApi } from "@/lib/api/userApi";

interface OnlineUsersProps {
  channelId?: string;
  workspaceId?: string;
  maxDisplay?: number;
}

export function OnlineUsers({
  channelId,
  workspaceId,
  maxDisplay = 5,
}: OnlineUsersProps) {
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const { subscribe, isConnected } = useWebSocket();

  // Subscribe to presence updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe("presence:update", (data) => {
      console.log("Received presence update:", data);

      if (channelId && data.channelId === channelId) {
        setOnlineUserIds(data.users || []);
      } else if (workspaceId && data.workspaceId === workspaceId) {
        setOnlineUserIds(data.users || []);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [channelId, workspaceId, isConnected, subscribe]);

  // Fetch user details for online users
  useEffect(() => {
    if (onlineUserIds.length === 0) return;

    const fetchUsers = async () => {
      try {
        // Fetch user details for each online user
        const userPromises = onlineUserIds.map((id) => userApi.getUserById(id));
        const userResponses = await Promise.all(userPromises);

        // Extract user data from responses
        const users = userResponses
          .filter((response) => response?.data)
          .map((response) => response!.data);

        setOnlineUsers(users);
      } catch (error) {
        console.error("Failed to fetch online users:", error);
      }
    };

    fetchUsers();
  }, [onlineUserIds]);

  if (onlineUsers.length === 0) {
    return null;
  }

  // Display users up to maxDisplay, and show a count for the rest
  const displayUsers = onlineUsers.slice(0, maxDisplay);
  const remainingCount = onlineUsers.length - displayUsers.length;

  return (
    <div className="flex items-center space-x-1">
      <TooltipProvider>
        {displayUsers.map((user) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar className="h-6 w-6 border border-primary">
                  <AvatarImage
                    src={user.avatarUrl || "/placeholder-user.jpg"}
                    alt={user.firstName || user.username || "User"}
                  />
                  <AvatarFallback>
                    {user.firstName
                      ? user.firstName.charAt(0)
                      : user.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-1 ring-white" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {user.firstName
                  ? `${user.firstName} ${user.lastName || ""}`.trim()
                  : user.username}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="h-6 rounded-full px-2 text-xs"
              >
                +{remainingCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {remainingCount} more online{" "}
                {remainingCount === 1 ? "user" : "users"}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
}
