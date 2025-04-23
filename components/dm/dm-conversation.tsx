"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useDM } from "@/contexts/dm-context";
import { useWebSocket } from "@/contexts/websocket-context";
import { messageApi } from "@/lib/api/messageApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
// We're using our own time formatting function instead of formatDistanceToNow
import { toast } from "sonner";
import { ChatInput } from "@/components/chat/chat-input";
import { EnhancedMessageRenderer } from "@/components/chat/enhanced-message-renderer";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name?: string;
  sender_avatar?: string;
  user_id?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  timestamp?: number; // Unix timestamp in milliseconds
  is_pending?: boolean;
}

export function DMConversation() {
  const { channelId } = useParams();
  const { user } = useAuth();
  const { dmChannels, markChannelAsRead } = useDM();
  const [channel, setChannel] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  // We don't need newMessage state anymore as it's handled by the ChatInput component
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Keep track of messages being processed to prevent duplicates
  const processedMessageIds = useRef<Set<string>>(new Set());

  // Find the channel in the context
  useEffect(() => {
    if (dmChannels && channelId) {
      const foundChannel = dmChannels.find((c) => c.id === channelId);
      if (foundChannel) {
        setChannel(foundChannel);
      }
    }
  }, [dmChannels, channelId]);

  const { isConnected, subscribe, sendMessage } = useWebSocket();

  // Fetch messages for this channel
  useEffect(() => {
    if (!channelId) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        // First check session storage for any cached messages
        let cachedMessages = [];
        try {
          const storedMessages = sessionStorage.getItem(
            `dm-messages-${channelId}`
          );
          if (storedMessages) {
            cachedMessages = JSON.parse(storedMessages);
            console.log(
              "Found cached messages in session storage:",
              cachedMessages.length
            );
          }
        } catch (error) {
          console.error("Failed to retrieve cached messages:", error);
        }

        // Then fetch from API
        console.log(
          `Calling messageApi.getChannelMessages for channel ${channelId}`
        );
        const response = await messageApi.getChannelMessages(
          channelId as string
        );

        console.log("API response for messages:", response);

        // Store the successful response in session storage for future use
        try {
          sessionStorage.setItem(
            `dm-messages-${channelId}-last-response`,
            JSON.stringify(response)
          );
        } catch (storageError) {
          console.error(
            "Failed to store API response in session storage:",
            storageError
          );
        }

        // Process messages to ensure proper user information and sorting
        const processedMessages = (response.data || []).map((msg: any) => {
          // If this is the current user's message, ensure the name is displayed correctly
          if (msg.user_id === user?.id || msg.sender_id === user?.id) {
            return {
              ...msg,
              sender_id: user?.id || "",
              sender_name: user?.firstName || user?.username || "You",
              // Ensure we have a consistent sender_id field
              user_id: user?.id || "",
            };
          }
          return msg;
        });

        // Combine API messages with cached messages, removing duplicates
        const apiMessageIds = new Set(
          processedMessages.map((msg: any) => msg.id)
        );
        const uniqueCachedMessages = cachedMessages.filter(
          (msg: any) => !apiMessageIds.has(msg.id) && msg.is_pending
        );

        const combinedMessages = [
          ...processedMessages,
          ...uniqueCachedMessages,
        ];

        // Sort messages by timestamp to ensure correct order (oldest first)
        const sortedMessages = [...combinedMessages].sort((a, b) => {
          const timeA = new Date(a.created_at).getTime();
          const timeB = new Date(b.created_at).getTime();
          return timeA - timeB; // Ascending order (oldest first)
        });

        // Log the sorted messages for debugging
        console.log(
          "Sorted messages timestamps:",
          sortedMessages.map((msg) => {
            return {
              id: msg.id,
              content:
                msg.content.substring(0, 20) +
                (msg.content.length > 20 ? "..." : ""),
              created_at: msg.created_at,
              timestamp: new Date(msg.created_at).getTime(),
            };
          })
        );

        console.log("Combined and sorted messages:", sortedMessages);
        setMessages(sortedMessages);

        // Mark the channel as read
        if (channelId) {
          markChannelAsRead(channelId as string);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        toast.error("Failed to load messages");

        // If API fails, try to use cached messages as fallback
        try {
          // First try to get the last successful API response
          const lastResponse = sessionStorage.getItem(
            `dm-messages-${channelId}-last-response`
          );

          if (lastResponse) {
            console.log(
              "Found last successful API response in session storage"
            );
            const response = JSON.parse(lastResponse);

            // Process messages to ensure proper user information and sorting
            const processedMessages = (response.data || []).map((msg: any) => {
              // If this is the current user's message, ensure the name is displayed correctly
              if (msg.user_id === user?.id || msg.sender_id === user?.id) {
                return {
                  ...msg,
                  sender_id: user?.id || "",
                  sender_name: user?.firstName || user?.username || "You",
                  // Ensure we have a consistent sender_id field
                  user_id: user?.id || "",
                };
              }
              return msg;
            });

            // Sort messages by timestamp
            const sortedMessages = [...processedMessages].sort((a, b) => {
              const timeA = new Date(a.created_at).getTime();
              const timeB = new Date(b.created_at).getTime();
              return timeA - timeB;
            });

            console.log("Using last successful API response as fallback");
            setMessages(sortedMessages);
            return;
          }

          // If no last response, try to get cached messages
          const storedMessages = sessionStorage.getItem(
            `dm-messages-${channelId}`
          );
          if (storedMessages) {
            const cachedMessages = JSON.parse(storedMessages);
            console.log(
              "Using cached messages as fallback:",
              cachedMessages.length
            );

            // Sort messages by timestamp
            const sortedMessages = [...cachedMessages].sort((a, b) => {
              const timeA = new Date(a.created_at).getTime();
              const timeB = new Date(b.created_at).getTime();
              return timeA - timeB;
            });

            setMessages(sortedMessages);
          }
        } catch (cacheError) {
          console.error("Failed to retrieve cached messages:", cacheError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
    // markChannelAsRead is now memoized and won't cause infinite loops
  }, [channelId, user, markChannelAsRead]);

  // Subscribe to new messages via WebSocket
  useEffect(() => {
    if (!channelId || !isConnected) return;

    console.log("WebSocket connected, subscribing to channel messages");

    // Join the channel room - only once per channel
    console.log("Joining channel:", channelId);
    // Use a direct event type instead of the message event to prevent multiple joins
    sendMessage({
      type: "join:channel",
      channelId: channelId,
    });

    // Also try the legacy join method as a fallback
    setTimeout(() => {
      if (isConnected) {
        console.log("Sending fallback channel join for:", channelId);
        sendMessage({
          type: "message",
          channelId: channelId,
          messageType: "join:channel",
        });
      }
    }, 1000);

    // Subscribe to channel join confirmation
    const joinUnsubscribe = subscribe("channel:joined", (data) => {
      console.log("Channel join confirmation received:", data);
      if (data.channelId === channelId && data.success) {
        console.log(`Successfully joined channel ${channelId}`);
      }
    });

    // Subscribe to new messages for this channel
    const messageUnsubscribe = subscribe("message", (data) => {
      console.log("Received message via WebSocket:", data);

      // Check if this is a fallback message broadcast to all clients
      const isFallbackMessage = data._fallback === true;

      // Only process messages for this channel or fallback messages for this channel
      if (
        data.channel_id === channelId ||
        data.channelId === channelId ||
        (isFallbackMessage &&
          (data.channel_id === channelId || data.channelId === channelId))
      ) {
        // Create a unique message signature for deduplication
        // This helps identify duplicate messages even if they have different IDs
        const messageSignature = `${data.sender_id || data.user_id}:${
          data.content
        }`;
        console.log(`Message signature: ${messageSignature}`);

        // Force refresh the messages from the server if this is a message from another user
        // This ensures we get all messages in the correct order
        const isFromOtherUser =
          data.sender_id !== user?.id && data.user_id !== user?.id;

        if (isFromOtherUser) {
          console.log("Message is from another user, refreshing messages");
          // Refresh messages from the server to ensure we have all messages
          messageApi
            .getChannelMessages(channelId as string)
            .then((response) => {
              // Process messages to ensure proper user information
              const processedMessages = (response.data || []).map(
                (msg: any) => {
                  // If this is the current user's message, ensure the name is displayed correctly
                  if (msg.user_id === user?.id || msg.sender_id === user?.id) {
                    return {
                      ...msg,
                      sender_id: user?.id || "",
                      sender_name: user?.firstName || user?.username || "You",
                      // Ensure we have a consistent sender_id field
                      user_id: user?.id || "",
                    };
                  }
                  return msg;
                }
              );

              // Sort messages by timestamp
              const sortedMessages = [...processedMessages].sort((a, b) => {
                const timeA = new Date(a.created_at).getTime();
                const timeB = new Date(b.created_at).getTime();
                return timeA - timeB;
              });

              console.log("Refreshed messages from server:", sortedMessages);
              setMessages(sortedMessages);

              // Mark the channel as read
              markChannelAsRead(channelId as string);
            })
            .catch((error) => {
              console.error("Failed to refresh messages:", error);
            });

          return;
        }

        setMessages((prev) => {
          // STEP 1: Check if we've already processed this exact message ID
          if (data.id && processedMessageIds.current.has(data.id)) {
            console.log(
              "Message already processed by ID, not adding duplicate"
            );
            return prev;
          }

          // STEP 2: Check if message with this ID already exists in our state
          const existsById = data.id && prev.some((msg) => msg.id === data.id);
          if (existsById) {
            console.log(
              "Message already exists in state by ID, not adding duplicate"
            );
            return prev;
          }

          // STEP 3: Check if we have a temporary message that matches this one
          // This is for handling the case where we added a temp message and then got the real one
          const tempMessageIndex = prev.findIndex(
            (msg) =>
              msg.id.startsWith("temp-") &&
              msg.sender_id === (data.sender_id || data.user_id) &&
              msg.content === data.content
          );

          // If we found a matching temporary message, replace it with the real one
          if (tempMessageIndex >= 0) {
            console.log(
              "Found matching temporary message, replacing with real message"
            );

            // Mark this message ID as processed if it has one
            if (data.id) {
              processedMessageIds.current.add(data.id);
            }

            // Create a new array with the temporary message replaced
            const newMessages = [...prev];
            newMessages[tempMessageIndex] = {
              ...data,
              // Ensure we have consistent field names
              channel_id: data.channel_id || data.channelId,
              channelId: data.channel_id || data.channelId,
              id: data.id || newMessages[tempMessageIndex].id, // Keep temp ID if no real ID
              // If this is the current user's message, ensure the name is displayed correctly
              ...(data.sender_id === user?.id || data.user_id === user?.id
                ? {
                    sender_id: user?.id || "",
                    user_id: user?.id || "",
                    sender_name: user?.firstName || user?.username || "You",
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
              created_at:
                data.created_at || newMessages[tempMessageIndex].created_at,
              is_pending: false, // Mark as not pending since it's confirmed
            };

            return newMessages;
          }

          // STEP 4: Check for any similar message with the same content and sender
          // This is a more aggressive deduplication strategy
          const existingSimilarMessage = prev.some(
            (msg) =>
              msg.sender_id === (data.sender_id || data.user_id) &&
              msg.content === data.content
          );

          if (existingSimilarMessage) {
            console.log("Similar message already exists, not adding duplicate");
            return prev;
          }

          // If we get here, this is a new message we haven't seen before
          console.log("Adding new message from WebSocket");

          // Mark this message ID as processed if it has one
          if (data.id) {
            processedMessageIds.current.add(data.id);
          }

          // Process the message to ensure consistent format
          const processedMessage = {
            ...data,
            // Ensure we have consistent field names
            channel_id: data.channel_id || data.channelId,
            channelId: data.channel_id || data.channelId,
            id:
              data.id ||
              `generated-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 9)}`,
            // If this is the current user's message, ensure the name is displayed correctly
            ...(data.sender_id === user?.id || data.user_id === user?.id
              ? {
                  sender_id: user?.id || "",
                  user_id: user?.id || "",
                  sender_name: user?.firstName || user?.username || "You",
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

        // Mark the channel as read when receiving a new message
        if (channelId && document.visibilityState === "visible") {
          markChannelAsRead(channelId as string);
        }
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
  }, [
    channelId,
    isConnected,
    subscribe,
    sendMessage,
    user?.id,
    markChannelAsRead,
  ]);

  // Function to force scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    console.log("Force scrolling to bottom of messages");
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length === 0) return;

    // Scroll to bottom after a short delay to ensure rendering is complete
    const scrollTimeout = setTimeout(() => {
      scrollToBottom(true);
    }, 100);

    // Clean up timeout on unmount
    return () => clearTimeout(scrollTimeout);
  }, [messages, scrollToBottom]); // Run whenever messages change

  // Add a second scroll effect that runs after a longer delay
  // This helps ensure scrolling works even if images or other content
  // take longer to load
  useEffect(() => {
    if (messages.length === 0) return;

    const secondScrollTimeout = setTimeout(() => {
      scrollToBottom(false);
    }, 500);

    return () => clearTimeout(secondScrollTimeout);
  }, [messages, scrollToBottom]);

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

  // Add auto-refresh for messages
  useEffect(() => {
    if (!channelId) return;

    // Set up a periodic refresh to ensure messages are up to date
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        console.log("Auto-refreshing messages");
        messageApi
          .getChannelMessages(channelId as string)
          .then((response) => {
            // Process messages to ensure proper user information
            const processedMessages = (response.data || []).map((msg: any) => {
              // If this is the current user's message, ensure the name is displayed correctly
              if (msg.user_id === user?.id || msg.sender_id === user?.id) {
                return {
                  ...msg,
                  sender_id: user?.id || "",
                  sender_name: user?.firstName || user?.username || "You",
                  // Ensure we have a consistent sender_id field
                  user_id: user?.id || "",
                };
              }
              return msg;
            });

            // Sort messages by timestamp
            const sortedMessages = [...processedMessages].sort((a, b) => {
              const timeA = new Date(a.created_at).getTime();
              const timeB = new Date(b.created_at).getTime();
              return timeA - timeB;
            });

            // Only update if we have more messages than before or if the last message is different
            if (sortedMessages.length > 0) {
              setMessages((prev) => {
                if (sortedMessages.length > prev.length) {
                  console.log(
                    "Updating messages from auto-refresh - more messages"
                  );
                  return sortedMessages;
                }

                // Check if the last message is different
                const lastServerMsg = sortedMessages[sortedMessages.length - 1];
                const lastLocalMsg = prev[prev.length - 1];

                if (
                  lastServerMsg &&
                  lastLocalMsg &&
                  (lastServerMsg.id !== lastLocalMsg.id ||
                    lastServerMsg.content !== lastLocalMsg.content)
                ) {
                  console.log(
                    "Updating messages from auto-refresh - different last message"
                  );
                  return sortedMessages;
                }

                return prev;
              });
            }
          })
          .catch((error) => {
            console.error("Failed to auto-refresh messages:", error);
          });
      }
    }, 5000); // Refresh every 5 seconds

    return () => {
      clearInterval(refreshInterval);
    };
  }, [channelId, user]);

  // Clean up typing timeout and processed messages on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Clear the processed messages set
      processedMessageIds.current.clear();
    };
  }, []);

  // Periodically clean up the processed messages set to prevent memory leaks
  useEffect(() => {
    // Clean up old processed message IDs every 5 minutes
    const cleanupInterval = setInterval(() => {
      console.log(
        `Cleaning up processed messages set (size: ${processedMessageIds.current.size})`
      );
      processedMessageIds.current.clear();
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearInterval(cleanupInterval);
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
      sender_id: user?.id || "",
      sender_name: user?.firstName || user?.username || "You",
      sender_avatar: user?.avatarUrl, // Include the user's avatar
      created_at: new Date().toISOString(),
      is_pending: true, // Mark as pending until confirmed by server
    };

    // Add to local state
    setMessages((prev) => [...prev, newMsg]);

    // Store in session storage as backup
    try {
      const storedMessages = JSON.parse(
        sessionStorage.getItem(`dm-messages-${channelId}`) || "[]"
      );
      sessionStorage.setItem(
        `dm-messages-${channelId}`,
        JSON.stringify([...storedMessages, newMsg])
      );
    } catch (error) {
      console.error("Failed to store message in session storage:", error);
    }

    setIsSending(true);
    try {
      // Only send message via API for persistence and broadcasting
      // This prevents duplicate messages by having a single source of truth
      console.log("Sending message via API for persistence and broadcasting");
      const response = await messageApi.sendMessage(
        channelId as string,
        messageContent
      );

      // Mark the real message ID as processed to prevent duplicates
      if (response?.data?.id) {
        processedMessageIds.current.add(response.data.id);

        // Update the message in session storage with the real ID
        try {
          const storedMessages = JSON.parse(
            sessionStorage.getItem(`dm-messages-${channelId}`) || "[]"
          );
          const updatedMessages = storedMessages.map((msg: any) =>
            msg.id === tempId
              ? { ...msg, id: response.data.id, is_pending: false }
              : msg
          );
          sessionStorage.setItem(
            `dm-messages-${channelId}`,
            JSON.stringify(updatedMessages)
          );
        } catch (error) {
          console.error("Failed to update message in session storage:", error);
        }
      }

      // Always update the temporary message with the real ID
      // This ensures the message is updated even if WebSocket doesn't send a confirmation
      setMessages((prev) => {
        // First check if we already have a message with the same ID as the response
        const hasMessageWithRealId = prev.some(
          (msg) => msg.id === response?.data?.id
        );

        // Also check if we have any message with the same content that's not our temp message
        // This could happen if the WebSocket message arrived before the API response
        const hasSimilarMessage = prev.some(
          (msg) =>
            msg.id !== tempId &&
            msg.content === messageContent &&
            msg.sender_id === user.id &&
            // Only check messages from the last 10 seconds
            new Date().getTime() - new Date(msg.created_at).getTime() < 10000
        );

        if (hasMessageWithRealId || hasSimilarMessage) {
          console.log(
            "Message with real ID or similar message already exists, removing temporary message"
          );
          // If we already have the real message or a similar one, just remove the temporary one
          return prev.filter((msg) => msg.id !== tempId);
        } else {
          // Otherwise, update the temporary message with the real ID
          return prev.map((msg) =>
            msg.id === tempId
              ? {
                  ...msg,
                  id: response?.data?.id,
                  is_pending: false,
                  // Update with any additional data from the server
                  ...response?.data,
                  // Keep the sender_id, sender_name, and avatar to ensure proper display
                  sender_id: user.id,
                  sender_name: user.firstName || user.username || "You",
                  sender_avatar: user.avatarUrl,
                }
              : msg
          );
        }
      });

      // Log the current state of messages for debugging
      setTimeout(() => {
        setMessages((prev) => {
          console.log("Current messages after update:", prev);
          return prev;
        });
      }, 500);

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

  // Utility function to convert UTC ISO string or timestamp to local time
  const getLocalDate = (dateInput: string | number): Date => {
    // If it's a timestamp (number), create a date directly
    if (typeof dateInput === "number") {
      return new Date(dateInput);
    }

    // Otherwise, parse the ISO string
    return new Date(dateInput);
  };

  // Format message time in user's local timezone
  const formatMessageTime = (dateInput: string | number) => {
    try {
      // Convert the input to a local date object
      const localDate = getLocalDate(dateInput);

      // Check if the date is today in local time
      const today = new Date();
      const isToday =
        localDate.getDate() === today.getDate() &&
        localDate.getMonth() === today.getMonth() &&
        localDate.getFullYear() === today.getFullYear();

      // Check if the date is yesterday in local time
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday =
        localDate.getDate() === yesterday.getDate() &&
        localDate.getMonth() === yesterday.getMonth() &&
        localDate.getFullYear() === yesterday.getFullYear();

      // Format based on how recent the message is
      let formattedTime = "";

      // Use Intl.DateTimeFormat for more consistent formatting across browsers
      const timeFormatter = new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      if (isToday) {
        // For today's messages, just show the local time
        formattedTime = timeFormatter.format(localDate);
      } else if (isYesterday) {
        // For yesterday's messages
        formattedTime = "Yesterday at " + timeFormatter.format(localDate);
      } else {
        // Check if it's within the current year
        const isCurrentYear = localDate.getFullYear() === today.getFullYear();

        if (isCurrentYear) {
          // For dates in the current year, show month and day with time
          const dateFormatter = new Intl.DateTimeFormat(undefined, {
            month: "short",
            day: "numeric",
          });

          formattedTime =
            dateFormatter.format(localDate) +
            " at " +
            timeFormatter.format(localDate);
        } else {
          // For older dates, include the year
          const dateFormatter = new Intl.DateTimeFormat(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          formattedTime =
            dateFormatter.format(localDate) +
            " at " +
            timeFormatter.format(localDate);
        }
      }

      return formattedTime;
    } catch (error) {
      console.error("Error formatting date:", error, dateInput);
      return "Unknown time";
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
        <h2 className="text-2xl font-bold">Conversation not found</h2>
        <p className="text-muted-foreground">
          The conversation you're looking for doesn't exist or you don't have
          access to it.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage
              src={
                channel.other_user?.avatar_url
                  ? process.env.NEXT_PUBLIC_API_URL +
                    "/" +
                    channel.other_user?.avatar_url.split("/public")[1]
                  : "/placeholder-user.jpg"
              }
              alt={channel.other_user.username || "User"}
            />
            <AvatarFallback>
              {channel.other_user.first_name
                ? channel.other_user.first_name.charAt(0)
                : channel.other_user.username?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">
              {channel.other_user.first_name && channel.other_user.last_name
                ? `${channel.other_user.first_name} ${channel.other_user.last_name}`
                : channel.other_user.username}
            </h1>
            <p className="text-sm text-muted-foreground">
              {channel.other_user.username}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4" id="messages-container">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <h2 className="text-xl font-semibold">No messages yet</h2>
            <p className="text-muted-foreground">
              Send a message to start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Add a debug message count */}
            <div className="text-xs text-muted-foreground mb-2 text-center">
              Showing {messages.length} messages
            </div>

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
                      {message.timestamp
                        ? formatMessageTime(message.timestamp)
                        : message.created_at
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
                      <EnhancedMessageRenderer
                        content={message.content || "No content"}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* This is the element we scroll to */}
            <div ref={messagesEndRef} className="h-1" id="messages-end" />
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
        placeholder={`Message ${
          channel.other_user.first_name || channel.other_user.username
        }`}
        disabled={isSending}
        onTyping={handleTyping}
        className="border-t"
      />
    </div>
  );
}
