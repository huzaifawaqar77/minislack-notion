"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import {
  PlusCircle,
  MoreVertical,
  Archive,
  Trash2,
  Edit,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { CreateTaskDialog } from "./create-task-dialog";
import { TaskDetailsDialog } from "./task-details-dialog";
import { Task } from "@/lib/api/taskApi";
import { useRouter } from "next/navigation";

interface TaskBoardProps {
  projectId: string;
}

export function TaskBoard({ projectId }: TaskBoardProps) {
  const router = useRouter();
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    fetchLabels,
    updateTaskDetails,
    removeTask,
    toggleArchiveTask,
  } = useProject();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Use a ref to track if we've already fetched the data
  const dataFetchedRef = useRef(false);

  // Only fetch tasks and labels when the component mounts
  useEffect(() => {
    // Only fetch data if we haven't already and we have a projectId
    if (!dataFetchedRef.current && projectId) {
      fetchTasks(projectId);
      fetchLabels(projectId);
      dataFetchedRef.current = true;
    }
  }, [projectId, fetchTasks, fetchLabels]);

  const handleArchiveTask = async (id: string, archive: boolean) => {
    await toggleArchiveTask(id, archive);
  };

  const handleDeleteTask = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this task? This action cannot be undone."
      )
    ) {
      await removeTask(id);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: string) => {
    await updateTaskDetails(task.id, undefined, undefined, newStatus);
  };

  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsDialogOpen(true);
  };

  // Group tasks by status
  const tasksByStatus: Record<string, Task[]> = {
    todo: [],
    in_progress: [],
    completed: [],
  };

  tasks.forEach((task) => {
    if (!task.is_archived) {
      if (!tasksByStatus[task.status]) {
        tasksByStatus[task.status] = [];
      }
      tasksByStatus[task.status].push(task);
    }
  });

  const statusLabels: Record<string, { label: string; icon: React.ReactNode }> =
    {
      todo: {
        label: "To Do",
        icon: <Clock className="h-4 w-4 text-slate-500" />,
      },
      in_progress: {
        label: "In Progress",
        icon: <AlertCircle className="h-4 w-4 text-blue-500" />,
      },
      completed: {
        label: "Completed",
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      },
    };

  const priorityLabels: Record<string, { label: string; color: string }> = {
    low: { label: "Low", color: "bg-slate-100 text-slate-700" },
    medium: { label: "Medium", color: "bg-blue-100 text-blue-700" },
    high: { label: "High", color: "bg-orange-100 text-orange-700" },
    urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Tasks</h2>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        Error loading tasks: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(statusLabels).map(([status, { label, icon }]) => (
          <div key={status} className="space-y-2">
            <div className="flex items-center gap-2 font-medium text-sm">
              {icon}
              <h3>{label}</h3>
              <Badge variant="outline" className="ml-auto">
                {tasksByStatus[status]?.length || 0}
              </Badge>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg min-h-[200px]">
              {tasksByStatus[status]?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center text-sm text-muted-foreground">
                  <p>No tasks in this column</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <PlusCircle className="mr-2 h-3 w-3" /> Add Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasksByStatus[status]?.map((task) => (
                    <Card
                      key={task.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => openTaskDetails(task)}
                    >
                      <CardHeader className="p-3 pb-0">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-sm font-medium">
                            {task.title}
                          </CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openTaskDetails(task);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Move to</DropdownMenuLabel>
                              {Object.entries(statusLabels).map(
                                ([statusKey, { label }]) =>
                                  statusKey !== task.status && (
                                    <DropdownMenuItem
                                      key={statusKey}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusChange(task, statusKey);
                                      }}
                                    >
                                      {label}
                                    </DropdownMenuItem>
                                  )
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchiveTask(task.id, true);
                                }}
                              >
                                <Archive className="mr-2 h-4 w-4" /> Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500 focus:text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task.id);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-1">
                        {task.description && (
                          <CardDescription className="text-xs line-clamp-2">
                            {task.description}
                          </CardDescription>
                        )}
                      </CardContent>
                      <CardFooter className="p-3 pt-0 flex justify-between items-center text-xs">
                        <div className="flex gap-1">
                          {task.priority && (
                            <Badge
                              className={
                                priorityLabels[task.priority]?.color ||
                                "bg-slate-100"
                              }
                              variant="secondary"
                            >
                              {priorityLabels[task.priority]?.label ||
                                task.priority}
                            </Badge>
                          )}
                          {task.due_date && (
                            <Badge variant="outline" className="gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(task.due_date).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                        {task.assigned_to && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="" alt="Assignee" />
                            <AvatarFallback className="text-xs">
                              {task.assigned_to.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        projectId={projectId}
      />

      {selectedTask && (
        <TaskDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          task={selectedTask}
        />
      )}
    </div>
  );
}
