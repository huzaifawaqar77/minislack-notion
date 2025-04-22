"use client";

import { ReactNode, useState } from "react";
import Image from "next/image";
import { Header } from "./header";
import { Sidebar, MobileSidebar } from "./new-sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 items-start">
        <aside
          className={cn(
            "fixed top-[64px] bottom-0 z-30 hidden flex-col border-r bg-sidebar md:flex overflow-hidden",
            isCollapsed ? "md:w-[50px]" : "md:w-[220px] lg:w-[240px]"
          )}
        >
          <div className="flex h-10 items-center justify-between px-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-7 w-7", isCollapsed ? "mx-auto" : "ml-auto")}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-all text-sidebar-foreground/70 hover:text-sidebar-foreground",
                  isCollapsed && "rotate-180"
                )}
              />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </div>
          <Sidebar isCollapsed={isCollapsed} className="flex-1" />
        </aside>
        <div
          className={cn(
            "flex w-full flex-col overflow-hidden bg-background",
            isCollapsed ? "md:pl-[50px]" : "md:pl-[220px] lg:pl-[240px]"
          )}
        >
          <div className="flex items-center border-b px-4 py-2 md:hidden">
            <MobileSidebar />
            <Image
              src="/logos/logo-full.svg"
              alt="MinSlack"
              width={120}
              height={28}
              className="ml-2"
            />
          </div>
          <main className="flex w-full flex-col overflow-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
