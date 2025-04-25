"use client";

import React, { useState, useEffect, useRef } from "react";
import { useProject } from "@/contexts/project-context";
import { Task, TaskComment, TaskActivity } from "@/lib/api/taskApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow, format } from "date-fns";
import {
  Calendar,
  Clock,
  MessageSquare,
  Activity,
  Edit,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  getTaskComments,
  getTaskActivity,
  createTaskComment,
} from "@/lib/api/taskApi";

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

export function TaskDetailsDialog({
  open,
  onOpenChange,
  task,
}: TaskDetailsDialogProps) {
  const { updateTaskDetails, fetchProjectMembers, projectMembers, loading } =
    useProject();
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority || "medium");
  const [assignedTo, setAssignedTo] = useState(
    task.assigned_to || "unassigned"
  );
  const [dueDate, setDueDate] = useState(
    task.due_date ? format(new Date(task.due_date), "yyyy-MM-dd") : ""
  );
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Use a ref to track if we've already fetched the data
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch data if the dialog is open, we have a task, and we haven't fetched yet
    if (open && task && !dataFetchedRef.current) {
      fetchProjectMembers(task.project_id);
      fetchComments();
      fetchActivities();
      dataFetchedRef.current = true;
    }

    // Reset the ref when the dialog is closed so we can fetch again next time it opens
    if (!open) {
      dataFetchedRef.current = false;
    }
  }, [open, task, fetchProjectMembers]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await getTaskComments(task.id);
      if (response.success) {
        setComments(response.data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchActivities = async () => {
    setLoadingActivities(true);
    try {
      const response = await getTaskActivity(task.id);
      if (response.success) {
        setActivities(response.data);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await createTaskComment(task.id, newComment);
      if (response.success) {
        setNewComment("");
        fetchComments();
      }
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSaveChanges = async () => {
    await updateTaskDetails(
      task.id,
      title,
      description,
      status,
      priority,
      assignedTo === "unassigned" ? null : assignedTo,
      dueDate || null
    );
    setEditMode(false);
  };

  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description || "");
    setStatus(task.status);
    setPriority(task.priority || "medium");
    setAssignedTo(task.assigned_to || "unassigned");
    setDueDate(
      task.due_date ? format(new Date(task.due_date), "yyyy-MM-dd") : ""
    );
    setEditMode(false);
  };

  const priorityLabels: Record<string, { label: string; color: string }> = {
    low: { label: "Low", color: "bg-slate-100 text-slate-700" },
    medium: { label: "Medium", color: "bg-blue-100 text-blue-700" },
    high: { label: "High", color: "bg-orange-100 text-orange-700" },
    urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
  };

  const statusIcons: Record<string, React.ReactNode> = {
    todo: <Clock className="h-4 w-4 text-slate-500" />,
    in_progress: <AlertCircle className="h-4 w-4 text-blue-500" />,
    completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            {editMode ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold"
              />
            ) : (
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
            )}
            {!editMode ? (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setEditMode(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  onClick={handleSaveChanges}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                {editMode ? (
                  <Select
                    value={status}
                    onValueChange={(value) => setStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    {statusIcons[task.status] || <Clock className="h-4 w-4" />}
                    <span className="capitalize">
                      {task.status.replace(/_/g, " ")}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <Label>Priority</Label>
                {editMode ? (
                  <Select
                    value={priority}
                    onValueChange={(value) => setPriority(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1">
                    {task.priority ? (
                      <Badge
                        className={
                          priorityLabels[task.priority]?.color || "bg-slate-100"
                        }
                        variant="secondary"
                      >
                        {priorityLabels[task.priority]?.label || task.priority}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label>Assigned To</Label>
                {editMode ? (
                  <Select
                    value={assignedTo}
                    onValueChange={(value) => setAssignedTo(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {projectMembers.map((member) => (
                        <SelectItem key={member.user_id} value={member.user_id}>
                          {member.first_name && member.last_name
                            ? `${member.first_name} ${member.last_name}`
                            : member.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1">
                    {task.assigned_to ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="" alt="Assignee" />
                          <AvatarFallback className="text-xs">
                            {task.assigned_to.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {projectMembers.find(
                            (m) => m.user_id === task.assigned_to
                          )?.username || "Unknown User"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label>Due Date</Label>
                {editMode ? (
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    {task.due_date ? (
                      <>
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(task.due_date), "MMM d, yyyy")}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">No due date</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Description</Label>
              {editMode ? (
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter task description"
                  rows={5}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 text-sm">
                  {task.description ? (
                    <p className="whitespace-pre-wrap">{task.description}</p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No description provided
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span>Created: </span>
                <span>
                  {formatDistanceToNow(new Date(task.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              {task.updated_at !== task.created_at && (
                <div>
                  <span>Updated: </span>
                  <span>
                    {formatDistanceToNow(new Date(task.updated_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4 mt-4">
            <div className="space-y-4">
              {loadingComments ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No comments yet
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={comment.avatar_url || ""}
                          alt={comment.username}
                        />
                        <AvatarFallback>
                          {comment.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div className="font-medium">
                            {comment.first_name && comment.last_name
                              ? `${comment.first_name} ${comment.last_name}`
                              : comment.username}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                        <div className="text-sm mt-1 whitespace-pre-wrap">
                          {comment.content}
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSubmitComment} className="space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!newComment.trim() || submittingComment}
                >
                  {submittingComment && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Comment
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 mt-4">
            {loadingActivities ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No activity recorded
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-2">
                    <div className="flex-shrink-0 mt-1">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={activity.avatar_url || ""}
                            alt={activity.username}
                          />
                          <AvatarFallback className="text-xs">
                            {activity.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {activity.first_name && activity.last_name
                            ? `${activity.first_name} ${activity.last_name}`
                            : activity.username}
                        </span>
                        <span className="text-sm">
                          {activity.action === "created"
                            ? "created this task"
                            : activity.action === "updated"
                            ? "updated this task"
                            : activity.action === "commented"
                            ? "commented on this task"
                            : activity.action === "archived"
                            ? "archived this task"
                            : activity.action === "unarchived"
                            ? "unarchived this task"
                            : activity.action}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatDistanceToNow(new Date(activity.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      {activity.action === "updated" && activity.details && (
                        <div className="mt-2 text-sm pl-8 space-y-1">
                          {Object.entries(activity.details).map(
                            ([key, value]: [string, any]) => (
                              <div key={key}>
                                <span className="font-medium capitalize">
                                  {key.replace(/_/g, " ")}
                                </span>
                                : Changed from "
                                {value.from === null
                                  ? "none"
                                  : String(value.from)}
                                " to "
                                {value.to === null ? "none" : String(value.to)}"
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
