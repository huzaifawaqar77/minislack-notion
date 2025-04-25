"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MessageSquare, Search, User } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { GlobalOnlineUsers } from "@/components/global-online-users";
import { NotificationBell } from "@/components/notification/notification-bell";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Image from "next/image";

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mx-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block text-accent">
              UIFlexer
            </span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/features"
                    className={navigationMenuTriggerStyle()}
                  >
                    Features
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/pricing"
                    className={navigationMenuTriggerStyle()}
                  >
                    Pricing
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/docs"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            Documentation
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Learn how to integrate MinSlack into your workflow.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="/docs/getting-started"
                        >
                          <div className="text-sm font-medium leading-none">
                            Getting Started
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Step-by-step guide to set up MinSlack.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="/docs/api"
                        >
                          <div className="text-sm font-medium leading-none">
                            API Reference
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Detailed API documentation for developers.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>MinSlack</SheetTitle>
              <SheetDescription>Modern communication platform</SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col gap-4 pt-6">
              <Link
                href="/"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/" ? "text-primary" : "text-muted-foreground"
                )}
              >
                Home
              </Link>
              <Link
                href="/features"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/features"
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/pricing"
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/docs"
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                Documentation
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {isAuthenticated && (
              <Button variant="outline" size="icon" className="mr-2">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Online users indicator */}
                <div className="hidden md:flex mr-2">
                  <GlobalOnlineUsers maxDisplay={3} />
                </div>
                <NotificationBell />
                <Button variant="outline" size="icon">
                  <MessageSquare className="h-4 w-4" />
                  <span className="sr-only">Messages</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            process.env.NEXT_PUBLIC_API_URL +
                              "/" +
                              user?.avatarUrl?.split("/public")[1] ||
                            "/placeholder-user.jpg"
                          }
                          className="h-full w-full object-cover"
                          alt={user?.username || "User"}
                        />
                        <AvatarFallback>
                          {user?.firstName?.charAt(0) ||
                            user?.username?.charAt(0) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.firstName} {user?.lastName || user?.username}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href="/dashboard/profile" className="flex w-full">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/dashboard" className="flex w-full">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/settings" className="flex w-full">
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
