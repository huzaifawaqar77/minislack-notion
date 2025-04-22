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

interface GlobalOnlineUsersProps {
  maxDisplay?: number;
}

export function GlobalOnlineUsers({ maxDisplay = 5 }: GlobalOnlineUsersProps) {
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const {
    onlineUsers: onlineUserIds,
    onlineCount,
    isConnected,
  } = useWebSocket();

  // Fetch user details for online users
  useEffect(() => {
    if (onlineUserIds.length === 0) return;

    // Limit the number of users we fetch to avoid performance issues
    const limitedUserIds = onlineUserIds.slice(0, maxDisplay + 5);

    const fetchUsers = async () => {
      try {
        // Fetch user details for each online user
        const userPromises = limitedUserIds.map((id) =>
          userApi.getUserById(id)
        );
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
  }, [onlineUserIds, maxDisplay]);

  if (onlineCount === 0) {
    return null;
  }

  // Display users up to maxDisplay, and show a count for the rest
  const displayUsers = onlineUsers.slice(0, maxDisplay);
  const remainingCount = onlineCount - displayUsers.length;

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
