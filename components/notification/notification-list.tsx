"use client";

import React, { useEffect, useState } from "react";
import { useNotification } from "@/contexts/notification-context";
import { NotificationItem } from "./notification-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Bell, BellOff } from "lucide-react";
import { TestNotificationButton } from "./test-notification-button";
import { NotificationSkeletonList } from "./notification-skeleton";

export function NotificationList() {
  const { notifications, loading, error, fetchNotifications, markAllAsRead } =
    useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications(50, 0, activeTab === "unread");
  }, [activeTab]);

  // Filter notifications based on search query
  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between flex-wrap gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* <TestNotificationButton /> */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead()}
            disabled={loading}
          >
            Mark all as read
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-1">
            <Bell className="h-4 w-4" />
            <span>All</span>
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-1">
            <BellOff className="h-4 w-4" />
            <span>Unread</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {renderNotificationContent()}
        </TabsContent>

        <TabsContent value="unread" className="mt-4">
          {renderNotificationContent()}
        </TabsContent>
      </Tabs>
    </div>
  );

  function renderNotificationContent() {
    // Use a consistent container with min-height to prevent layout shifts
    const containerClass = "min-h-[400px]";

    if (loading) {
      return <NotificationSkeletonList />;
    }

    if (error) {
      return (
        <div
          className={`flex flex-col items-center justify-center py-8 text-center ${containerClass}`}
        >
          <p className="text-destructive mb-4">{error}</p>
          <Button
            onClick={() => fetchNotifications(50, 0, activeTab === "unread")}
          >
            Try Again
          </Button>
        </div>
      );
    }

    if (filteredNotifications.length === 0) {
      return (
        <div
          className={`flex flex-col items-center justify-center py-12 text-center ${containerClass}`}
        >
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No notifications</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "No notifications match your search."
              : activeTab === "unread"
              ? "You have no unread notifications."
              : "You have no notifications."}
          </p>
        </div>
      );
    }

    return (
      <div className={`space-y-2 ${containerClass}`}>
        {paginatedNotifications.map((notification) => (
          <div
            key={notification.id}
            className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden"
          >
            <NotificationItem notification={notification} showActions={true} />
          </div>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    );
  }
}
