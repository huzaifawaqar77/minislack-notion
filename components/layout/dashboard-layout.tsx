"use client";

import { ReactNode } from "react";
import { Header } from "./header";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col w-full max-w-full">
        <Header />
        <div className="flex-1 flex w-full max-w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto p-5 md:p-6 lg:p-8 bg-background w-full">
            <div className="mb-5 flex items-center">
              <SidebarTrigger className="mr-3 border border-border/40 hover:bg-accent/10 hover:text-accent" />
            </div>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
