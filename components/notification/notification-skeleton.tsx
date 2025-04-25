"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function NotificationSkeleton() {
  return (
    <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="flex flex-col items-start gap-1 p-3">
        <div className="flex items-start gap-3 w-full">
          {/* Avatar skeleton */}
          <Skeleton className="h-8 w-8 rounded-full" />

          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/4" />
          </div>

          {/* Actions skeleton */}
          <div className="flex items-center gap-1">
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationSkeletonList() {
  return (
    <div className="space-y-2 min-h-[400px]">
      {Array(3).fill(0).map((_, index) => (
        <NotificationSkeleton key={index} />
      ))}
    </div>
  );
}
