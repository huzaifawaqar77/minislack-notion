"use client";

import React, { useEffect } from "react";
import { ProjectProvider } from "@/contexts/project-context";
import { useAuth } from "@/contexts/auth-context";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      redirect("/login?callbackUrl=/projects");
    }
  }, [isLoading, isAuthenticated]);

  // Show loading spinner while checking authentication
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <ProjectProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </ProjectProvider>
  );
}
