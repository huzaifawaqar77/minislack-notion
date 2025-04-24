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
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          {activeWorkspace && (
            <p className="text-sm text-muted-foreground">
              {activeWorkspace.name}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Welcome back, {user?.firstName || user?.username}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-2 text-muted-foreground">
            Loading dashboard data...
          </span>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-6">
            <div className="text-center text-destructive">{error}</div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Messages
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardStats?.totalMessages.toLocaleString()}
                  </div>
                  <p
                    className={`text-xs ${
                      dashboardStats?.messageGrowth
                        ? dashboardStats.messageGrowth > 0
                          ? "text-green-500"
                          : dashboardStats.messageGrowth < 0
                          ? "text-red-500"
                          : "text-muted-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {dashboardStats?.messageGrowth &&
                    dashboardStats.messageGrowth > 0
                      ? "+"
                      : ""}
                    {dashboardStats?.messageGrowth?.toFixed(1) || "0.0"}% from
                    last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardStats?.activeUsers}
                  </div>
                  <p
                    className={`text-xs ${
                      dashboardStats?.userGrowth
                        ? dashboardStats.userGrowth > 0
                          ? "text-green-500"
                          : dashboardStats.userGrowth < 0
                          ? "text-red-500"
                          : "text-muted-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {dashboardStats?.userGrowth && dashboardStats.userGrowth > 0
                      ? "+"
                      : ""}
                    {dashboardStats?.userGrowth?.toFixed(1) || "0.0"}% from last
                    month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Channels
                  </CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardStats?.activeChannels}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{dashboardStats?.newChannels} new channels this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Shared Files
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardStats?.totalFiles.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{dashboardStats?.newFiles} files this week
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
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
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickMargin={10}
                          />
                          <YAxis tick={{ fontSize: 12 }} tickMargin={10} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="messages"
                            name="Messages"
                            stroke="var(--accent)"
                            strokeWidth={2}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">
                        No activity data available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Top Channels</CardTitle>
                  <CardDescription>Your most active channels.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardStats?.topChannels &&
                    dashboardStats.topChannels.length > 0 ? (
                      dashboardStats.topChannels.map((channel) => (
                        <div
                          key={channel.channel_id}
                          className="flex items-center"
                        >
                          <div className="w-full flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">
                                {channel.channel_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {channel.message_count} messages
                              </p>
                            </div>
                            <div className="mt-1 h-2 w-full rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${channel.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        No channel activity data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Detailed analytics for your workspace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Analytics will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>
                  Generate and view reports for your workspace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Reports will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Manage your notification settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Notification settings will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
