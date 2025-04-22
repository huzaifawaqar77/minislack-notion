"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart,
  FileText,
  Home,
  MessageSquare,
  PlusCircle,
  Settings,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
    {
      href: "/dashboard",
      icon: Home,
      title: "Dashboard",
    },
    {
      href: "/dashboard/messages",
      icon: MessageSquare,
      title: "Messages",
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
      href: "/dashboard/analytics",
      icon: BarChart,
      title: "Analytics",
    },
    {
      href: "/dashboard/settings",
      icon: Settings,
      title: "Settings",
    },
  ];

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Workspaces
            </h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <PlusCircle className="h-4 w-4" />
                    <span className="sr-only">Add workspace</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create new workspace</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="space-y-1 pt-2">
            <Button
              variant="secondary"
              className="w-full justify-start"
            >
              <span className="truncate">My Workspace</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <span className="truncate">Team Alpha</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <span className="truncate">Project Beta</span>
            </Button>
          </div>
        </div>
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                  pathname === route.href
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <route.icon className="h-4 w-4" />
                <span>{route.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
