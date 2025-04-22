"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDM } from "@/contexts/dm-context";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, X, UserPlus } from "lucide-react";
import { userApi } from "@/lib/api";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  email?: string;
}

export function NewDM() {
  const { createOrGetDMChannel } = useDM();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // This is a placeholder - you'll need to implement a user search API
        const response = await userApi.searchUsers(searchQuery);
        setUsers(response.data || []);
        setFilteredUsers(response.data || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        toast.error("Failed to fetch users");
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if there's a search query
    if (searchQuery.length >= 2) {
      fetchUsers();
    } else {
      setFilteredUsers([]);
    }
  }, [searchQuery]);

  // Handle starting a DM with a user
  const handleStartDM = async (userId: string) => {
    try {
      setIsLoading(true);
      const channel = await createOrGetDMChannel(userId);
      router.push(`/dashboard/dm/${channel.id}`);
    } catch (err) {
      console.error("Failed to start DM:", err);
      toast.error("Failed to start conversation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">New Message</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for users..."
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
        ) : searchQuery.length < 2 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-32">
            <p className="text-sm text-muted-foreground">
              Type at least 2 characters to search for users
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-32">
            <p className="text-sm text-muted-foreground">
              No users found matching "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                className="w-full flex items-center p-3 hover:bg-accent/50 transition-colors focus:outline-none focus:bg-accent/50 text-left"
                onClick={() => handleStartDM(user.id)}
                disabled={user.id === currentUser?.id}
              >
                <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
                  <AvatarImage
                    src={user.avatar_url || "/placeholder-user.jpg"}
                    alt={user.username || "User"}
                  />
                  <AvatarFallback>
                    {user.first_name
                      ? user.first_name.charAt(0)
                      : user.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate">
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.username}
                    </span>
                    {user.id !== currentUser?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Start conversation"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email || user.username}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
