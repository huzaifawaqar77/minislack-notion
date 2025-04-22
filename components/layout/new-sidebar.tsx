"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart,
  FileText,
  Home,
  LayoutDashboard,
  Loader2,
  Mail,
  MessageSquare,
  PlusCircle,
  Settings,
  User,
  Users,
} from "lucide-react";
import { useWorkspace, Workspace } from "@/contexts/workspace-context";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { ChannelList } from "@/components/channel/channel-list";
import { DMSidebar } from "@/components/dm/dm-sidebar";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean;
  isDesktop?: boolean;
}

export function Sidebar({
  className,

  isCollapsed = false,
  isDesktop = true,
  ...props
}: SidebarProps) {
  const pathname = usePathname();
  const { workspaces, activeWorkspace, isLoading, setActiveWorkspace } =
    useWorkspace();

  const routes = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      title: "Dashboard",
    },
    {
      href: "/dashboard/dm",
      icon: MessageSquare,
      title: "Direct Messages",
    },
    {
      href: "/dashboard/channels",
      icon: FileText,
      title: "Channels",
    },
    {
      href: "/dashboard/members",
      icon: Users,
      title: "Members",
    },
    {
      href: "/dashboard/invitations",
      icon: Mail,
      title: "Invitations",
    },
    {
      href: "/dashboard/analytics",
      icon: BarChart,
      title: "Analytics",
    },
    {
      href: "/dashboard/workspace-settings",
      icon: Settings,
      title: "Workspace Settings",
    },
    {
      href: "/dashboard/profile",
      icon: User,
      title: "Profile",
    },
  ];

  return (
    <div
      className={cn("h-full flex flex-col text-sidebar-foreground", className)}
      {...props}
    >
      <div
        className={cn(
          "flex items-center",
          isCollapsed ? "justify-center py-3" : "px-4 py-3"
        )}
      >
        {isCollapsed ? (
          <div className="bg-accent rounded-md w-8 h-8 flex items-center justify-center">
            <span className="font-bold text-accent-foreground">M</span>
          </div>
        ) : (
          <span className="font-bold text-xl">MinSlack</span>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 py-2">
          <div className={cn("py-2", isCollapsed ? "px-1" : "px-3")}>
            <div
              className={cn(
                "flex items-center",
                isCollapsed ? "justify-center" : "justify-between mb-2"
              )}
            >
              {!isCollapsed && (
                <h2 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                  Workspaces
                </h2>
              )}
              {!isCollapsed && (
                <CreateWorkspaceDialog
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only">Add workspace</span>
                    </Button>
                  }
                />
              )}
            </div>
            <div className="space-y-1 mt-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-sidebar-foreground/70" />
                </div>
              ) : workspaces.length === 0 ? (
                <div className="px-2 py-2 text-center text-xs text-sidebar-foreground/70">
                  No workspaces
                </div>
              ) : (
                workspaces.map((workspace) => (
                  <Button
                    key={workspace.id}
                    variant="ghost"
                    className={cn(
                      activeWorkspace?.id === workspace.id
                        ? "bg-sidebar-accent"
                        : "hover:bg-sidebar-accent",
                      "w-full text-sidebar-foreground justify-start",
                      isCollapsed ? "h-8 w-8 p-0 mx-auto" : "px-2 py-1 h-auto"
                    )}
                    onClick={() => setActiveWorkspace(workspace)}
                  >
                    {isCollapsed ? (
                      <div className="flex h-8 w-8 items-center justify-center">
                        <span className="sr-only">{workspace.name}</span>
                        <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-accent text-accent-foreground text-xs font-medium">
                          {workspace.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <span className="truncate text-sm">{workspace.name}</span>
                    )}
                  </Button>
                ))
              )}
            </div>
          </div>
          <div className="mx-1 h-px bg-sidebar-border" />

          {activeWorkspace && (
            <>
              <div className={cn("py-2", isCollapsed ? "px-1" : "px-3")}>
                <ChannelList isCollapsed={isCollapsed} />
              </div>
              <div className="mx-1 h-px bg-sidebar-border" />
              <div className={cn("py-2", isCollapsed ? "px-1" : "px-3")}>
                <DMSidebar isCollapsed={isCollapsed} />
              </div>
            </>
          )}

          <div className="mx-1 h-px bg-sidebar-border" />
          <div className={cn("py-2", isCollapsed ? "px-1" : "px-3")}>
            {!isCollapsed && (
              <h2 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-2">
                Navigation
              </h2>
            )}
            <div className="space-y-1 mt-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md text-sm font-medium transition-all",
                    pathname === route.href
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    isCollapsed
                      ? "h-8 w-8 justify-center p-0 mx-auto"
                      : "px-2 py-1.5"
                  )}
                >
                  <route.icon
                    className={cn("h-4 w-4", isCollapsed ? "h-5 w-5" : "")}
                  />
                  {!isCollapsed && <span>{route.title}</span>}
                  {isCollapsed && (
                    <span className="sr-only">{route.title}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

interface MobileSidebarProps {}

export function MobileSidebar({}: MobileSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <ScrollArea className="h-full">
          <Sidebar isDesktop={false} className="w-full" />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function Menu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
