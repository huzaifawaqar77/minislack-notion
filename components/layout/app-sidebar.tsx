"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart,
  FileText,
  Home,
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  Settings,
  User,
  Users,
  Kanban,
  ChevronDown,
  ChevronUp,
  Mail,
  Search,
  Bell,
  Calendar,
  FolderKanban,
  Inbox,
  MoreHorizontal,
} from "lucide-react";

import { useWorkspace, Workspace } from "@/contexts/workspace-context";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { ChannelList } from "@/components/channel/channel-list";
import { DMSidebar } from "@/components/dm/dm-sidebar";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
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
      href: "/projects",
      icon: Kanban,
      title: "Projects",
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
    <Sidebar
      collapsible="icon"
      className="bg-sidebar border-r border-sidebar-border shadow-sm overflow-x-hidden"
    >
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-center px-4 py-3">
          <Image
            src="/logos/logo-full.svg"
            alt="MinSlack"
            width={130}
            height={30}
            className="dark:hidden"
          />
          <Image
            src="/logos/logo-full-dark.svg"
            alt="MinSlack"
            width={130}
            height={30}
            className="hidden dark:block"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Workspaces Section */}
        <SidebarGroup>
          <div className="flex items-center justify-between px-4 py-2">
            <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
              Workspaces
            </SidebarGroupLabel>
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
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaces.map((workspace) => (
                <SidebarMenuItem key={workspace.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeWorkspace?.id === workspace.id}
                    onClick={() => setActiveWorkspace(workspace)}
                  >
                    <button className="w-full">
                      <div className="flex items-center">
                        <Avatar className="h-5 w-5 mr-2">
                          <AvatarImage
                            src={workspace.image_url || ""}
                            alt={workspace.name}
                          />
                          <AvatarFallback className="text-xs">
                            {workspace.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{workspace.name}</span>
                      </div>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Channels Section */}
        {activeWorkspace && (
          <>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroup>
                <div className="flex items-center justify-between px-4 py-2">
                  <CollapsibleTrigger className="flex items-center text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                    Channels
                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <ChannelList isCollapsed={false} />
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>

            <SidebarSeparator />

            {/* Direct Messages Section */}
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroup>
                <div className="flex items-center justify-between px-4 py-2">
                  <CollapsibleTrigger className="flex items-center text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                    Direct Messages
                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <DMSidebar isCollapsed={false} />
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>

            <SidebarSeparator />
          </>
        )}

        {/* Navigation Section */}
        <SidebarGroup>
          <div className="px-4 py-2">
            <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
              Navigation
            </SidebarGroupLabel>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map((route) => (
                <SidebarMenuItem key={route.href}>
                  <SidebarMenuButton asChild isActive={pathname === route.href}>
                    <Link href={route.href}>
                      <route.icon className="h-4 w-4" />
                      <span>{route.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage
                      src={
                        process.env.NEXT_PUBLIC_API_URL +
                          "/" +
                          user?.avatarUrl?.split("/public")[1] ||
                        "/placeholder-user.jpg"
                      }
                      alt={user?.username || "User"}
                    />
                    <AvatarFallback>
                      {user?.firstName?.charAt(0) ||
                        user?.username?.charAt(0) ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    {user?.firstName || user?.username}
                  </span>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {}}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
