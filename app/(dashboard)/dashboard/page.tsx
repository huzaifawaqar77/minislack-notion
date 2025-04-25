"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  MessageSquare,
  Users,
  FileText,
  Loader2,
  Activity,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useWorkspace } from "@/contexts/workspace-context";
import {
  getWorkspaceDashboardStats,
  DashboardStats,
} from "@/services/dashboardService";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { WorldMap } from "@/components/ui/world-map";
import { NotificationList } from "@/components/notification/notification-list";
import { NotificationSettings } from "@/components/notification/notification-settings";

export default function DashboardPage() {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!activeWorkspace?.id) return;

      try {
        setLoading(true);
        console.log(
          "Fetching dashboard stats for workspace:",
          activeWorkspace.id
        );
        console.log("Auth token:", localStorage.getItem("auth_token"));

        const stats = await getWorkspaceDashboardStats(activeWorkspace.id);
        console.log("Dashboard stats received:", stats);
        setDashboardStats(stats);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching dashboard stats:", err);
        // Log more detailed error information
        if (err.response) {
          console.error("Error response:", {
            status: err.response.status,
            data: err.response.data,
            headers: err.response.headers,
          });
        }
        setError(
          `Failed to load dashboard data: ${err.message || "Unknown error"}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [activeWorkspace?.id]);

  // Format activity data for the chart
  const formattedActivityData =
    dashboardStats?.activityData?.map((item) => ({
      date: format(new Date(item.date), "MMM dd"),
      messages: item.count,
    })) || [];

  return (
    <div className="flex-1 space-y-4">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-purple-500">
            Dashboard
          </h2>
          {activeWorkspace && (
            <p className="text-sm text-muted-foreground">UIFlexer</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Welcome back,{" "}
            <span className="font-medium text-purple-400">
              {user?.firstName || user?.username}
            </span>
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <span className="ml-2 text-muted-foreground">
            Loading dashboard data...
          </span>
        </div>
      ) : error ? (
        <Card className="bg-[#1e1e2f] border-none shadow-md">
          <CardContent className="py-6">
            <div className="text-center text-red-400">{error}</div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-[#1e1e2f] border-none">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              Reports
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              Notifications
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-[#1e1e2f] border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Messages
                  </CardTitle>
                  <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {dashboardStats?.totalMessages.toLocaleString() || "33"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    0.0% from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#1e1e2f] border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Users
                  </CardTitle>
                  <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Users className="h-4 w-4 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {dashboardStats?.activeUsers || "4"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    0.0% from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#1e1e2f] border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Channels
                  </CardTitle>
                  <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <BarChart className="h-4 w-4 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {dashboardStats?.activeChannels || "1"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{dashboardStats?.newChannels || "2"} new channels this
                    month
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#1e1e2f] border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Shared Files
                  </CardTitle>
                  <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {dashboardStats?.totalFiles.toLocaleString() || "2"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{dashboardStats?.newFiles || "2"} files this week
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 bg-[#1e1e2f] border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-purple-500">
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your team's activity over the past 30 days.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {formattedActivityData.length > 0 ? (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={formattedActivityData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12, fill: "#9ca3af" }}
                            tickMargin={10}
                            stroke="#374151"
                          />
                          <YAxis
                            tick={{ fontSize: 12, fill: "#9ca3af" }}
                            tickMargin={10}
                            stroke="#374151"
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e1e2f",
                              borderColor: "#374151",
                              borderRadius: "0.5rem",
                              color: "#fff",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="messages"
                            name="Messages"
                            stroke="#a855f7"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                              r: 6,
                              fill: "#a855f7",
                              stroke: "#1e1e2f",
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] w-full bg-[#252538] rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">
                        No activity data available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="col-span-3 bg-[#1e1e2f] border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-purple-500">
                    Top Channels
                  </CardTitle>
                  <CardDescription>Your most active channels.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {dashboardStats?.topChannels &&
                    dashboardStats.topChannels.length > 0 ? (
                      dashboardStats.topChannels.map((channel) => (
                        <div
                          key={channel.channel_id}
                          className="flex items-center"
                        >
                          <div className="w-full flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-white">
                                {channel.channel_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {channel.message_count} messages
                              </p>
                            </div>
                            <div className="h-2 w-full rounded-full bg-[#252538]">
                              <div
                                className="h-full rounded-full bg-purple-500"
                                style={{ width: `${channel.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        <div className="space-y-6">
                          <div className="flex items-center">
                            <div className="w-full flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-white">
                                  general
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  33 messages
                                </p>
                              </div>
                              <div className="h-2 w-full rounded-full bg-[#252538]">
                                <div
                                  className="h-full rounded-full bg-purple-500"
                                  style={{ width: "100%" }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* World Map Visualization */}
            <div className="mt-4">
              <WorldMap />
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-[#1e1e2f] border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-purple-500">Analytics</CardTitle>
                <CardDescription>
                  Detailed analytics for your workspace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full bg-[#252538] rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Analytics will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports" className="space-y-4">
            <Card className="bg-[#1e1e2f] border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-purple-500">Reports</CardTitle>
                <CardDescription>
                  Generate and view reports for your workspace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full bg-[#252538] rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Reports will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notifications" className="space-y-4">
            <Card className="bg-[#1e1e2f] border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-purple-500">Notifications</CardTitle>
                <CardDescription>
                  View and manage your notifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="list">
                  <TabsList className="mb-4">
                    <TabsTrigger value="list">Notification List</TabsTrigger>
                    <TabsTrigger value="settings">
                      Notification Settings
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="list">
                    <NotificationList />
                  </TabsContent>
                  <TabsContent value="settings">
                    <NotificationSettings />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
