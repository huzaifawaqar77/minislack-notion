"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Notification } from "@/lib/api/notificationApi";
import { useNotification } from "@/contexts/notification-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Trash2, MessageSquare, Users, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface NotificationItemProps {
  notification: Notification;
  showActions?: boolean;
}

export function NotificationItem({
  notification,
  showActions = true,
}: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotification();

  // Get notification icon based on type
  const getNotificationIcon = () => {
    switch (notification.type) {
      case "mention":
      case "channel_message":
      case "direct_message":
      case "reply":
        return <MessageSquare className="h-4 w-4" />;
      case "workspace_invitation":
      case "channel_invitation":
        return <Users className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Get notification link based on type
  const getNotificationLink = () => {
    // Use action_url if available
    if (notification.action_url) {
      return notification.action_url;
    } else if (notification.channel_id) {
      return `/dashboard/channels/${notification.channel_id}`;
    } else if (notification.workspace_id) {
      return `/dashboard/workspaces/${notification.workspace_id}`;
    } else {
      return "/dashboard?tab=notifications";
    }
  };

  // Handle mark as read
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    markAsRead(notification.id);
  };

  // Handle delete
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    deleteNotification(notification.id);
  };

  return (
    <div
      className={cn(
        "flex flex-col items-start gap-1 p-3 cursor-pointer rounded-md min-h-[80px]",
        !notification.is_read && "bg-accent/20"
      )}
    >
      <Link href={getNotificationLink()} className="w-full">
        <div className="flex items-start gap-3 w-full">
          {/* Sender avatar or notification icon */}
          {notification.sender_id ? (
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage
                src={
                  process.env.NEXT_PUBLIC_API_URL +
                    "/" +
                    notification.sender_avatar_url?.split("/public")[1] ||
                  "/placeholder-user.jpg"
                }
                alt={notification.sender_username || "User"}
              />
              <AvatarFallback>
                {notification.sender_first_name?.[0] ||
                  notification.sender_username?.[0] ||
                  "U"}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {getNotificationIcon()}
            </div>
          )}

          {/* Notification content */}
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none line-clamp-1">
              {notification.title}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {notification.content}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
              })}
            </p>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {!notification.is_read && (
                <button
                  onClick={handleMarkAsRead}
                  className="h-6 w-6 rounded-full hover:bg-accent flex items-center justify-center"
                  title="Mark as read"
                >
                  <Check className="h-3 w-3" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="h-6 w-6 rounded-full hover:bg-accent flex items-center justify-center"
                title="Delete notification"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
