"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useChannel } from "@/contexts/channel-context";
import { useWebSocket } from "@/contexts/websocket-context";
import { channelApi, messageApi } from "@/lib/api";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare } from "lucide-react";
import { OnlineUsers } from "@/components/online-users";
import { toast } from "sonner";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageRenderer } from "@/components/chat/message-renderer";

interface Message {
  id: string;
  content: string;
  sender_id?: string;
  user_id?: string; // Backend sometimes uses user_id instead of sender_id
  sender_name?: string;
  username?: string; // Backend sometimes provides username
  first_name?: string; // Backend sometimes provides first_name
  last_name?: string; // Backend sometimes provides last_name
  sender_avatar?: string;
  avatar_url?: string; // Backend sometimes uses avatar_url instead of sender_avatar
  created_at: string;
  updated_at?: string;
  channel_id?: string;
  is_pending?: boolean;
}

// Helper function to format message timestamps
function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  // For messages from today, just show the time
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // For messages from yesterday, show "Yesterday" and time
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // For older messages, show the date and time
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function ChannelPage() {
  const { channelId } = useParams();
  const { user } = useAuth();
  const { channels } = useChannel();
  const [channel, setChannel] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  // We don't need newMessage state anymore as it's handled by the ChatInput component
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find the channel in the context
  useEffect(() => {
    if (channels && channelId) {
      const foundChannel = channels.find((c) => c.id === channelId);
      if (foundChannel) {
        setChannel(foundChannel);
      }
    }
  }, [channels, channelId]);

  const { isConnected, subscribe, sendMessage } = useWebSocket();

  // Fetch messages for this channel
  useEffect(() => {
    if (!channelId) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await messageApi.getChannelMessages(
          channelId as string
        );

        // Process messages to ensure proper user information and sorting
        const processedMessages = (response.data || []).map((msg) => {
          // If this is the current user's message, ensure the name is displayed correctly
          if (msg.user_id === user?.id || msg.sender_id === user?.id) {
            return {
              ...msg,
              sender_id: user.id,
              sender_name: user.firstName || user.username || "You",
              // Ensure we have a consistent sender_id field
              user_id: user.id,
            };
          }

          // For other users' messages, ensure we have a proper sender_name
          return {
            ...msg,
            // If the message has first_name/last_name fields, use them for sender_name
            sender_name:
              msg.sender_name ||
              (msg.first_name
                ? `${msg.first_name} ${msg.last_name || ""}`.trim()
                : msg.username) ||
              "Unknown User",
            // Ensure we have a consistent sender_id field
            sender_id: msg.sender_id || msg.user_id,
          };
        });

        // Sort messages by creation time (oldest first)
        const sortedMessages = [...processedMessages].sort((a, b) => {
          const timeA = new Date(a.created_at).getTime();
          const timeB = new Date(b.created_at).getTime();
          return timeA - timeB;
        });

        setMessages(sortedMessages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        toast.error("Failed to load messages");
        // Fallback to dummy data if API fails
        setMessages([
          {
            id: "1",
            content: "Welcome to this channel!",
            sender_id: "system",
            sender_name: "System",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            content: "This is a test message.",
            sender_id: user?.id || "unknown",
            sender_name: user?.firstName || user?.username || "You",
            created_at: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [channelId, user]);

  // Subscribe to new messages via WebSocket
  useEffect(() => {
    if (!channelId || !isConnected) return;

    console.log("WebSocket connected, subscribing to channel messages");

    // Join the channel room
    console.log("Joining channel:", channelId);
    sendMessage({
      type: "join:channel",
      channelId: channelId,
    });

    // Subscribe to channel join confirmation
    const joinUnsubscribe = subscribe("channel:joined", (data) => {
      console.log("Channel join confirmation received:", data);
      if (data.channelId === channelId && data.success) {
        console.log(`Successfully joined channel ${channelId}`);
        // You could trigger a re-fetch of messages here if needed
      }
    });

    // Subscribe to new messages for this channel
    const messageUnsubscribe = subscribe("message", (data) => {
      console.log("Received message via WebSocket:", data);
      // Only process messages for this channel
      // Check both channel_id (from API) and channelId (from WebSocket)
      if (data.channel_id === channelId || data.channelId === channelId) {
        setMessages((prev) => {
          // Check if this is a confirmation of a pending message
          const pendingIndex = prev.findIndex(
            (msg) =>
              msg.is_pending &&
              msg.sender_id === data.sender_id &&
              msg.content === data.content
          );

          if (pendingIndex >= 0) {
            console.log("Found pending message to update", prev[pendingIndex]);
            // Replace the pending message with the confirmed one
            const newMessages = [...prev];
            newMessages[pendingIndex] = {
              ...data,
              is_pending: false,
              // If this is the current user's message, ensure the name is displayed correctly
              ...(data.sender_id === user?.id
                ? {
                    sender_name: user.firstName || user.username || "You",
                  }
                : {}),
            };
            return newMessages;
          }

          // Check if message already exists to prevent duplicates
          // Check by ID first
          const existsById = prev.some((msg) => msg.id === data.id);
          if (existsById) {
            console.log("Message already exists (by ID), not adding duplicate");
            return prev;
          }

          // Also check by content and sender to catch duplicates with different IDs
          const existsByContent = prev.some(
            (msg) =>
              msg.content === data.content &&
              (msg.sender_id === data.sender_id ||
                msg.user_id === data.sender_id) &&
              // Only consider messages within the last 5 seconds to avoid false positives
              new Date(msg.created_at).getTime() > Date.now() - 5000
          );
          if (existsByContent) {
            console.log(
              "Message already exists (by content), not adding duplicate"
            );
            return prev;
          }

          console.log("Adding new message from WebSocket");

          // Process the message to ensure consistent format
          const processedMessage = {
            ...data,
            // Ensure we have consistent field names
            channel_id: data.channel_id || data.channelId,
            channelId: data.channel_id || data.channelId,
            // If this is the current user's message, ensure the name is displayed correctly
            ...(data.sender_id === user?.id || data.user_id === user?.id
              ? {
                  sender_id: user.id,
                  user_id: user.id,
                  sender_name: user.firstName || user.username || "You",
                }
              : {
                  // For other users, ensure we have a proper sender_name
                  sender_name:
                    data.sender_name ||
                    (data.first_name
                      ? `${data.first_name} ${data.last_name || ""}`.trim()
                      : data.username) ||
                    "Unknown User",
                  // Ensure we have a consistent sender_id field
                  sender_id: data.sender_id || data.user_id,
                }),
            // Ensure we have a created_at timestamp
            created_at: data.created_at || new Date().toISOString(),
          };

          // Add the processed message and sort
          const newMessages = [...prev, processedMessage].sort((a, b) => {
            const timeA = new Date(a.created_at).getTime();
            const timeB = new Date(b.created_at).getTime();
            return timeA - timeB;
          });

          return newMessages;
        });
      }
    });

    // Subscribe to message updates
    const updateUnsubscribe = subscribe("message:update", (data) => {
      console.log("Received message update via WebSocket:", data);
      if (data.channel_id === channelId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.id ? { ...msg, content: data.content } : msg
          )
        );
      }
    });

    // Subscribe to message deletions
    const deleteUnsubscribe = subscribe("message:delete", (data) => {
      console.log("Received message deletion via WebSocket:", data);
      if (data.channel_id === channelId) {
        setMessages((prev) => prev.filter((msg) => msg.id !== data.id));
      }
    });

    // Subscribe to typing indicators
    const typingUnsubscribe = subscribe("typing:update", (data) => {
      if (data.channelId === channelId && data.userId !== user?.id) {
        // Handle typing indicator
        console.log(
          `User ${data.userId} is ${data.isTyping ? "typing" : "not typing"}`
        );

        // Update typing users state
        setTypingUsers((prev) => {
          if (data.isTyping) {
            // Add user to typing users if not already there
            return prev.includes(data.userId) ? prev : [...prev, data.userId];
          } else {
            // Remove user from typing users
            return prev.filter((id) => id !== data.userId);
          }
        });
      }
    });

    return () => {
      // Leave the channel room when unmounting
      console.log("Leaving channel:", channelId);
      sendMessage({
        type: "leave:channel",
        channelId: channelId,
      });

      // Unsubscribe from all events
      joinUnsubscribe();
      messageUnsubscribe();
      updateUnsubscribe();
      deleteUnsubscribe();
      typingUnsubscribe();
    };
  }, [channelId, isConnected, subscribe, sendMessage, user?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    // Scroll to bottom after a short delay to ensure rendering is complete
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]); // Run whenever messages change

  // Handle typing indicator
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = () => {
    if (!isTyping && isConnected && channelId) {
      setIsTyping(true);
      sendMessage({
        type: "typing:start",
        channelId: channelId,
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && isConnected && channelId) {
        setIsTyping(false);
        sendMessage({
          type: "typing:stop",
          channelId: channelId,
        });
      }
    }, 2000); // Stop typing after 2 seconds of inactivity
  };

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !channelId || !user) return;

    // Stop typing indicator
    if (isTyping && isConnected) {
      setIsTyping(false);
      sendMessage({
        type: "typing:stop",
        channelId: channelId,
      });
    }

    // Generate a temporary ID for the message
    const tempId = `temp-${Date.now()}`;
    const messageContent = content;

    // Add message to local state immediately for better UX
    const newMsg: Message = {
      id: tempId,
      content: messageContent,
      sender_id: user.id,
      sender_name: user.firstName || user.username || "You",
      sender_avatar: user.avatarUrl,
      created_at: new Date().toISOString(),
      is_pending: true, // Mark as pending until confirmed by server
    };

    setMessages((prev) => [...prev, newMsg]);

    setIsSending(true);
    try {
      // We'll only send via API now to avoid duplicates
      // The API will broadcast via WebSocket to all clients

      // Then send message via API for persistence
      const response = await messageApi.sendMessage(
        channelId as string,
        messageContent
      );

      // Always update the temporary message with the real ID
      // This ensures the message is updated even if WebSocket doesn't send a confirmation
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                id: response?.data?.id,
                is_pending: false,
                // Update with any additional data from the server
                ...response?.data,
                // Keep the sender_id and sender_name to ensure proper display
                sender_id: user.id,
                sender_name: user.firstName || user.username || "You",
              }
            : msg
        )
      );

      console.log("Updated temporary message with server response");
      console.log("Message sent successfully:", response?.data);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");

      // Remove the temporary message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Channel not found</h2>
        <p className="text-muted-foreground">
          The channel you're looking for doesn't exist or you don't have access
          to it.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h1 className="text-xl font-bold">#{channel.name}</h1>
          <p className="text-sm text-muted-foreground">
            {channel.description || "No description provided"}
          </p>
        </div>
        <OnlineUsers channelId={channelId} />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <h2 className="text-xl font-semibold">No messages yet</h2>
            <p className="text-muted-foreground">
              Be the first to send a message in this channel!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      message.sender_avatar ||
                      message.avatar_url ||
                      "/placeholder-user.jpg"
                    }
                    alt={message.sender_name || message.username || "User"}
                  />
                  <AvatarFallback>
                    {message.sender_id === user?.id ||
                    message.user_id === user?.id
                      ? user?.firstName
                        ? user?.firstName.charAt(0)
                        : user?.username?.charAt(0) || "Y"
                      : message.sender_name
                      ? message.sender_name.charAt(0)
                      : message.first_name
                      ? message.first_name.charAt(0)
                      : message.username
                      ? message.username.charAt(0)
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {message.sender_id === user?.id ||
                      message.user_id === user?.id
                        ? (user?.firstName
                            ? `${user?.firstName} ${
                                user?.lastName || ""
                              }`.trim()
                            : user?.username) || "You"
                        : message.sender_name ||
                          (message.first_name
                            ? `${message.first_name} ${
                                message.last_name || ""
                              }`.trim()
                            : message.username) ||
                          "Unknown User"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {message.created_at
                        ? formatMessageTime(message.created_at)
                        : "Unknown time"}
                    </span>
                  </div>
                  <div className="mt-1">
                    {message.is_pending ? (
                      <p className="text-muted-foreground italic">
                        {message.content || "No content"} (sending...)
                      </p>
                    ) : (
                      <MessageRenderer
                        content={message.content || "No content"}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-muted-foreground flex items-center">
          <div className="flex items-center mr-2">
            <span className="animate-bounce inline-block mr-0.5">•</span>
            <span className="animate-bounce inline-block animation-delay-200 mr-0.5">
              •
            </span>
            <span className="animate-bounce inline-block animation-delay-500 mr-0.5">
              •
            </span>
          </div>
          <span>
            {typingUsers.length === 1
              ? "Someone is typing..."
              : `${typingUsers.length} people are typing...`}
          </span>
        </div>
      )}
      <ChatInput
        onSendMessage={handleSendMessage}
        placeholder={`Message #${channel.name}`}
        disabled={isSending}
        onTyping={handleTyping}
        className="border-t"
      />
    </div>
  );
}
