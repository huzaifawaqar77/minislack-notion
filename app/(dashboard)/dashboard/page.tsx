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
import { MessageSquare, Users, FileText, Loader2 } from "lucide-react";
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
    <div className="flex-1 space-y-6 w-full max-w-full">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 w-full">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          {activeWorkspace && (
            <p className="text-sm text-muted-foreground">
              {activeWorkspace.name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-md">
            <span className="text-sm font-medium">Recent month</span>
          </div>
          <span className="text-sm text-muted-foreground">
            Welcome back,{" "}
            <span className="font-medium text-accent">
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
          <TabsList className="bg-background border border-border/40 rounded-md">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-accent/10 data-[state=active]:text-accent"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-accent/10 data-[state=active]:text-accent"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-accent/10 data-[state=active]:text-accent"
            >
              Reports
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-accent/10 data-[state=active]:text-accent"
            >
              Notifications
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4 w-full">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
              <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-background border-b border-border/40">
                  <CardTitle className="text-base font-medium">
                    Total Messages
                  </CardTitle>
                  <div className="h-9 w-9 rounded-md bg-accent/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-accent" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold">
                      {dashboardStats?.totalMessages.toLocaleString() ||
                        "19,626"}
                    </div>
                    <div className="flex items-center text-xs font-medium text-emerald-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-3 h-3 mr-1"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z"
                          clipRule="evenodd"
                        />
                      </svg>
                      +12.00% this week
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-background border-b border-border/40">
                  <CardTitle className="text-base font-medium">
                    Total Orders
                  </CardTitle>
                  <div className="h-9 w-9 rounded-md bg-emerald-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-emerald-500" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold">
                      {dashboardStats?.activeUsers.toLocaleString() || "3,290"}
                    </div>
                    <div className="flex items-center text-xs font-medium text-red-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-3 h-3 mr-1"
                      >
                        <path
                          fillRule="evenodd"
                          d="M1.22 5.222a.75.75 0 011.06 0L7 9.942l3.768-3.769a.75.75 0 011.113.058 20.908 20.908 0 013.813 7.254l1.574-2.727a.75.75 0 011.3.75l-2.475 4.286a.75.75 0 01-.916.357l-4.158-1.785a.75.75 0 11.599-1.369l3.198 1.374a19.41 19.41 0 00-3.592-6.62L7 11.75l-4.72-4.72a.75.75 0 010-1.06l-1.06 1.06a.75.75 0 01-1.06-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                      -3.00% this week
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-background border-b border-border/40">
                  <CardTitle className="text-base font-medium">
                    Total Products
                  </CardTitle>
                  <div className="h-9 w-9 rounded-md bg-sky-500/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-sky-500" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold">
                      {dashboardStats?.totalFiles.toLocaleString() || "322"}
                    </div>
                    <div className="flex items-center text-xs font-medium text-emerald-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-3 h-3 mr-1"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z"
                          clipRule="evenodd"
                        />
                      </svg>
                      +2.00% this week
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Website Growth Card */}
            <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-background border-b border-border/40">
                <CardTitle className="text-base font-medium">
                  Website Growth
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1">
                    <div className="text-5xl font-bold">97.14%</div>
                  </div>
                  <div className="w-40 h-40 relative">
                    <div className="w-full h-full rounded-full bg-muted/20 flex items-center justify-center">
                      <div
                        className="w-32 h-32 rounded-full border-8 border-accent"
                        style={{
                          borderRightColor: "transparent",
                          borderBottomColor: "rgba(var(--accent), 0.3)",
                          transform: "rotate(-45deg)",
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-accent mr-2"></div>
                        <span className="text-sm">Social media</span>
                      </div>
                      <span className="font-medium">55%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-sky-500 mr-2"></div>
                        <span className="text-sm">Purchased visitors</span>
                      </div>
                      <span className="font-medium">25%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="text-sm">Affiliate visitors</span>
                      </div>
                      <span className="font-medium">15%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                        <span className="text-sm">By advertisement</span>
                      </div>
                      <span className="font-medium">5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Sales Statistics Card */}
            <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-background border-b border-border/40">
                <div>
                  <CardTitle className="text-base font-medium">
                    Sales Statistics
                  </CardTitle>
                  <CardDescription>
                    $110,854.21{" "}
                    <span className="text-emerald-500 text-xs">+10%</span>
                  </CardDescription>
                </div>
                <div className="flex items-center">
                  <div className="text-sm font-medium bg-accent/10 text-accent px-3 py-1.5 rounded-md">
                    This Year
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {formattedActivityData.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={formattedActivityData}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          opacity={0.1}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          tickMargin={10}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickMargin={10}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => `$${value}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--background)",
                            borderColor: "var(--border)",
                            borderRadius: "0.5rem",
                          }}
                          formatter={(value) => [`$${value}k`, "Sales"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="messages"
                          name="Sales"
                          stroke="var(--accent)"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{
                            r: 6,
                            fill: "var(--accent)",
                            stroke: "var(--background)",
                          }}
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

            {/* Recent Orders Table */}
            <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-background border-b border-border/40 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    Recent Orders
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/40">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          <input
                            type="checkbox"
                            className="rounded border-border/40"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          # Order
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          id: "2323",
                          name: "Devon Lane",
                          email: "devon@example.com",
                          amount: "$778.35",
                          status: "Delivered",
                          date: "07.05.2023",
                        },
                        {
                          id: "2458",
                          name: "Darrell Steward",
                          email: "darrell@example.com",
                          amount: "$219.78",
                          status: "Delivered",
                          date: "03.07.2023",
                        },
                        {
                          id: "6289",
                          name: "Darlene Robertson",
                          email: "darlene@example.com",
                          amount: "$998.41",
                          status: "Cancelled",
                          date: "23.03.2023",
                        },
                        {
                          id: "3869",
                          name: "Courtney Henry",
                          email: "courtney@example.com",
                          amount: "$90.51",
                          status: "Pending",
                          date: "04.07.2023",
                        },
                      ].map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-border/40 hover:bg-muted/10"
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              className="rounded border-border/40"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {order.id}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-accent mr-2">
                                {order.name.charAt(0)}
                              </div>
                              <span className="text-sm font-medium">
                                {order.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {order.email}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            {order.amount}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs rounded-md ${
                                order.status === "Delivered"
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : order.status === "Cancelled"
                                  ? "bg-red-500/10 text-red-500"
                                  : "bg-yellow-500/10 text-yellow-500"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {order.date}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <button className="text-muted-foreground hover:text-foreground">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="19" cy="12" r="1" />
                                <circle cx="5" cy="12" r="1" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Calendar */}
            <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-background border-b border-border/40 pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">
                      Statistics
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-sm font-medium bg-accent/10 text-accent rounded-md">
                      Days
                    </button>
                    <button className="px-3 py-1.5 text-sm font-medium hover:bg-muted/20 rounded-md">
                      Weeks
                    </button>
                    <button className="px-3 py-1.5 text-sm font-medium hover:bg-muted/20 rounded-md">
                      Months
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-13 gap-1 mb-6">
                  {Array.from({ length: 13 }).map((_, i) => (
                    <div
                      key={i}
                      className={`text-center p-2 rounded-md ${
                        i === 9 ? "bg-accent text-white" : "hover:bg-muted/30"
                      }`}
                    >
                      <div className="text-sm font-medium">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {
                          ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][
                            i % 7
                          ]
                        }
                      </div>
                    </div>
                  ))}
                </div>

                <div className="h-[300px] relative">
                  <div className="absolute inset-0">
                    <svg viewBox="0 0 800 300" className="w-full h-full">
                      {/* Background grid lines */}
                      {Array.from({ length: 5 }).map((_, i) => (
                        <line
                          key={i}
                          x1="0"
                          y1={60 * i}
                          x2="800"
                          y2={60 * i}
                          stroke="currentColor"
                          strokeOpacity="0.1"
                          strokeDasharray="5,5"
                        />
                      ))}

                      {/* Time labels */}
                      {["4h", "3h", "2h", "1h"].map((label, i) => (
                        <text
                          key={i}
                          x="20"
                          y={60 * (i + 1) - 10}
                          fontSize="12"
                          fill="currentColor"
                          fillOpacity="0.5"
                        >
                          {label}
                        </text>
                      ))}

                      {/* X-axis time labels */}
                      {[
                        "7 am",
                        "8 am",
                        "9 am",
                        "10 am",
                        "11 am",
                        "12 pm",
                        "1 pm",
                        "2 pm",
                        "3 pm",
                        "4 pm",
                        "5 pm",
                        "6 pm",
                        "7 pm",
                        "8 pm",
                        "9 pm",
                        "10 pm",
                      ].map((label, i) => (
                        <text
                          key={i}
                          x={50 * i + 40}
                          y="290"
                          fontSize="10"
                          fill="currentColor"
                          fillOpacity="0.5"
                          textAnchor="middle"
                        >
                          {label}
                        </text>
                      ))}

                      {/* Main chart area */}
                      <path
                        d="M40,200 C60,180 80,220 100,150 C120,100 140,120 160,90 C180,70 200,120 220,100 C240,80 260,60 280,90 C300,120 320,180 340,150 C360,120 380,80 400,60 C420,40 440,90 460,120 C480,150 500,180 520,150 C540,120 560,90 580,120 C600,150 620,180 640,150 C660,120 680,90 700,120 C720,150 740,180 760,150"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="3"
                      />

                      {/* Dotted reference line */}
                      <path
                        d="M40,150 C60,140 80,160 100,130 C120,100 140,110 160,100 C180,90 200,110 220,100 C240,90 260,80 280,100 C300,120 320,150 340,130 C360,110 380,90 400,80 C420,70 440,100 460,120 C480,140 500,160 520,140 C540,120 560,100 580,120 C600,140 620,160 640,140 C660,120 680,100 700,120 C720,140 740,160 760,140"
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity="0.3"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Starting Calls and Break Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-6">
                <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="bg-background border-b border-border/40 pb-2">
                    <CardTitle className="text-base font-medium">
                      Starting Calls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/40">
                      {[
                        { name: "Liam Grayson", avatar: "L" },
                        { name: "Mia Jennings", avatar: "M" },
                      ].map((person, i) => (
                        <div
                          key={i}
                          className="flex items-center p-4 hover:bg-muted/10"
                        >
                          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-medium mr-3">
                            {person.avatar}
                          </div>
                          <span className="font-medium">{person.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="bg-background border-b border-border/40 pb-2">
                    <CardTitle className="text-base font-medium">
                      Break
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/40">
                      {[
                        {
                          name: "Jack Linton",
                          reason: "Cigarette break",
                          time: "00:17",
                        },
                        {
                          name: "Samuel Waters",
                          reason: "Lunch break",
                          time: "00:39",
                        },
                        {
                          name: "Henry Mercer",
                          reason: "Lunch break",
                          time: "00:51",
                        },
                        {
                          name: "Amelia Rowann",
                          reason: "Cigarette break",
                          time: "00:42",
                        },
                      ].map((person, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 hover:bg-muted/10"
                        >
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-medium mr-3">
                              {person.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{person.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {person.reason}
                              </div>
                            </div>
                          </div>
                          <div className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-xs font-medium">
                            {person.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow h-full">
                  <CardHeader className="bg-background border-b border-border/40 pb-2">
                    <CardTitle className="text-base font-medium">
                      Ongoing Calls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        {
                          name: "Sophia Hayes",
                          id: "35774",
                          time: "2h 46m",
                          calls: 34,
                          participants: 2,
                        },
                        {
                          name: "Owen Darnell",
                          id: "98745",
                          time: "3h 10m",
                          calls: 16,
                          participants: 4,
                        },
                        {
                          name: "Emma Larkin",
                          id: "85427",
                          time: "6h 25m",
                          calls: 29,
                          participants: 8,
                        },
                      ].map((call, i) => (
                        <Card
                          key={i}
                          className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center mb-4">
                              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-medium mr-3">
                                {call.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium">{call.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {call.id}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="mr-1 text-green-500"
                                >
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                                <span className="text-sm">{call.calls}</span>
                              </div>
                              <div className="text-sm font-medium">
                                {call.time}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="mr-1"
                                >
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <span className="text-sm">
                                  {call.participants}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {Array.from({ length: 20 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="w-4 h-4 rounded-full"
                                  style={{
                                    backgroundColor: [
                                      "var(--accent)",
                                      "#3b82f6",
                                      "#10b981",
                                      "#f59e0b",
                                      "#ef4444",
                                    ][Math.floor(Math.random() * 5)],
                                  }}
                                ></div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4 w-full">
            <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow w-full">
              <CardHeader className="bg-background border-b border-border/40">
                <CardTitle className="text-base font-medium">
                  Analytics
                </CardTitle>
                <CardDescription>
                  Detailed analytics for your workspace.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[400px] w-full bg-muted/10 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Analytics will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports" className="space-y-4 w-full">
            <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow w-full">
              <CardHeader className="bg-background border-b border-border/40">
                <CardTitle className="text-base font-medium">Reports</CardTitle>
                <CardDescription>
                  Generate and view reports for your workspace.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[400px] w-full bg-muted/10 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Reports will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notifications" className="space-y-4 w-full">
            <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow w-full">
              <CardHeader className="bg-background border-b border-border/40">
                <CardTitle className="text-base font-medium">
                  Notifications
                </CardTitle>
                <CardDescription>
                  View and manage your notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="list">
                  <TabsList className="bg-background border border-border/40 rounded-md mb-4">
                    <TabsTrigger
                      value="list"
                      className="data-[state=active]:bg-accent/10 data-[state=active]:text-accent"
                    >
                      Notification List
                    </TabsTrigger>
                    <TabsTrigger
                      value="settings"
                      className="data-[state=active]:bg-accent/10 data-[state=active]:text-accent"
                    >
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
