"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useWorkspace } from "./workspace-context";
import { useAuth } from "./auth-context";
import { toast } from "sonner";
import {
  Project,
  ProjectMember,
  getWorkspaceProjects,
  getUserProjects,
  getProject,
  getProjectMembers,
  createProject,
  updateProject,
  deleteProject,
  archiveProject,
  unarchiveProject,
  addProjectMember,
  removeProjectMember,
  updateProjectMemberRole,
} from "@/lib/api/projectApi";
import {
  Task,
  TaskLabel,
  getProjectTasks,
  getUserTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  archiveTask,
  unarchiveTask,
  getProjectLabels,
  createTaskLabel,
} from "@/lib/api/taskApi";

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  projectMembers: ProjectMember[];
  tasks: Task[];
  labels: TaskLabel[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchUserProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  fetchProjectMembers: (id: string) => Promise<void>;
  fetchTasks: (projectId: string) => Promise<void>;
  fetchUserTasks: () => Promise<void>;
  fetchLabels: (projectId: string) => Promise<void>;
  setActiveProject: (project: Project | null) => void;
  createNewProject: (
    name: string,
    description?: string,
    imageUrl?: string,
    isPublic?: boolean
  ) => Promise<Project | null>;
  updateProjectDetails: (
    id: string,
    name?: string,
    description?: string,
    imageUrl?: string,
    isPublic?: boolean
  ) => Promise<Project | null>;
  removeProject: (id: string) => Promise<boolean>;
  toggleArchiveProject: (
    id: string,
    archive: boolean
  ) => Promise<Project | null>;
  addMember: (
    projectId: string,
    userId: string,
    role?: string
  ) => Promise<ProjectMember | null>;
  removeMember: (projectId: string, userId: string) => Promise<boolean>;
  updateMemberRole: (
    projectId: string,
    userId: string,
    role: string
  ) => Promise<ProjectMember | null>;
  createNewTask: (
    title: string,
    projectId: string,
    description?: string,
    status?: string,
    priority?: string,
    assignedTo?: string,
    dueDate?: string,
    parentId?: string,
    position?: number
  ) => Promise<Task | null>;
  updateTaskDetails: (
    id: string,
    title?: string,
    description?: string,
    status?: string,
    priority?: string,
    assignedTo?: string | null,
    dueDate?: string | null,
    position?: number
  ) => Promise<Task | null>;
  removeTask: (id: string) => Promise<boolean>;
  toggleArchiveTask: (id: string, archive: boolean) => Promise<Task | null>;
  createNewLabel: (
    projectId: string,
    name: string,
    color?: string
  ) => Promise<TaskLabel | null>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { activeWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [labels, setLabels] = useState<TaskLabel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects for the active workspace
  const fetchProjects = async () => {
    if (!activeWorkspace) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getWorkspaceProjects(activeWorkspace.id);
      if (response.success) {
        setProjects(response.data);
      } else {
        setError(response.message || "Failed to fetch projects");
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch projects");
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects for the current user
  const fetchUserProjects = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getUserProjects();
      if (response.success) {
        setProjects(response.data);
      } else {
        setError(response.message || "Failed to fetch user projects");
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch user projects");
      console.error("Error fetching user projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a specific project
  const fetchProject = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getProject(id);
      if (response.success) {
        setActiveProject(response.data);
      } else {
        setError(response.message || "Failed to fetch project");
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch project");
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch project members
  const fetchProjectMembers = useCallback(
    async (id: string) => {
      // Check if we already have the members for this project to avoid unnecessary API calls
      if (
        activeProject &&
        activeProject.id === id &&
        projectMembers.length > 0
      ) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getProjectMembers(id);
        if (response.success) {
          setProjectMembers(response.data);
        } else {
          setError(response.message || "Failed to fetch project members");
        }
      } catch (error: any) {
        setError(error.message || "Failed to fetch project members");
        console.error("Error fetching project members:", error);
      } finally {
        setLoading(false);
      }
    },
    [activeProject, projectMembers]
  );

  // Fetch tasks for a project
  const fetchTasks = useCallback(
    async (projectId: string) => {
      // Check if we're already loading or if we have tasks for this project
      if (loading) return;

      // Check if we already have tasks for this project to avoid unnecessary API calls
      if (activeProject && activeProject.id === projectId && tasks.length > 0) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getProjectTasks(projectId);
        if (response.success) {
          setTasks(response.data);
        } else {
          setError(response.message || "Failed to fetch tasks");
        }
      } catch (error: any) {
        setError(error.message || "Failed to fetch tasks");
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, activeProject, tasks]
  );

  // Fetch tasks assigned to the current user
  const fetchUserTasks = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getUserTasks();
      if (response.success) {
        setTasks(response.data);
      } else {
        setError(response.message || "Failed to fetch user tasks");
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch user tasks");
      console.error("Error fetching user tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch labels for a project
  const fetchLabels = useCallback(
    async (projectId: string) => {
      // Check if we're already loading
      if (loading) return;

      // Check if we already have labels for this project to avoid unnecessary API calls
      if (
        activeProject &&
        activeProject.id === projectId &&
        labels.length > 0
      ) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getProjectLabels(projectId);
        if (response.success) {
          setLabels(response.data);
        } else {
          setError(response.message || "Failed to fetch labels");
        }
      } catch (error: any) {
        setError(error.message || "Failed to fetch labels");
        console.error("Error fetching labels:", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, activeProject, labels]
  );

  // Create a new project
  const createNewProject = async (
    name: string,
    description?: string,
    imageUrl?: string,
    isPublic?: boolean
  ) => {
    if (!activeWorkspace) {
      toast.error("No active workspace selected");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await createProject({
        name,
        description,
        imageUrl,
        isPublic,
        workspaceId: activeWorkspace.id,
      });

      if (response.success) {
        setProjects([response.data, ...projects]);
        toast.success("Project created successfully");
        return response.data;
      } else {
        setError(response.message || "Failed to create project");
        toast.error(response.message || "Failed to create project");
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create project";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error creating project:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update a project
  const updateProjectDetails = async (
    id: string,
    name?: string,
    description?: string,
    imageUrl?: string,
    isPublic?: boolean
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateProject(id, {
        name,
        description,
        imageUrl,
        isPublic,
      });

      if (response.success) {
        // Update projects list
        setProjects(projects.map((p) => (p.id === id ? response.data : p)));

        // Update active project if it's the one being updated
        if (activeProject && activeProject.id === id) {
          setActiveProject(response.data);
        }

        toast.success("Project updated successfully");
        return response.data;
      } else {
        setError(response.message || "Failed to update project");
        toast.error(response.message || "Failed to update project");
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update project";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error updating project:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a project
  const removeProject = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await deleteProject(id);

      if (response.success) {
        // Remove from projects list
        setProjects(projects.filter((p) => p.id !== id));

        // Clear active project if it's the one being deleted
        if (activeProject && activeProject.id === id) {
          setActiveProject(null);
        }

        toast.success("Project deleted successfully");
        return true;
      } else {
        setError(response.message || "Failed to delete project");
        toast.error(response.message || "Failed to delete project");
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete project";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error deleting project:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Archive or unarchive a project
  const toggleArchiveProject = async (id: string, archive: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const response = archive
        ? await archiveProject(id)
        : await unarchiveProject(id);

      if (response.success) {
        // Update projects list
        setProjects(projects.map((p) => (p.id === id ? response.data : p)));

        // Update active project if it's the one being archived/unarchived
        if (activeProject && activeProject.id === id) {
          setActiveProject(response.data);
        }

        toast.success(
          `Project ${archive ? "archived" : "unarchived"} successfully`
        );
        return response.data;
      } else {
        setError(
          response.message ||
            `Failed to ${archive ? "archive" : "unarchive"} project`
        );
        toast.error(
          response.message ||
            `Failed to ${archive ? "archive" : "unarchive"} project`
        );
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.message ||
        `Failed to ${archive ? "archive" : "unarchive"} project`;
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(
        `Error ${archive ? "archiving" : "unarchiving"} project:`,
        error
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add a member to a project
  const addMember = async (
    projectId: string,
    userId: string,
    role?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await addProjectMember(projectId, userId, role);

      if (response.success) {
        // Refresh project members
        await fetchProjectMembers(projectId);

        toast.success("Member added successfully");
        return response.data;
      } else {
        setError(response.message || "Failed to add member");
        toast.error(response.message || "Failed to add member");
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to add member";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error adding member:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Remove a member from a project
  const removeMember = async (projectId: string, userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await removeProjectMember(projectId, userId);

      if (response.success) {
        // Refresh project members
        await fetchProjectMembers(projectId);

        toast.success("Member removed successfully");
        return true;
      } else {
        setError(response.message || "Failed to remove member");
        toast.error(response.message || "Failed to remove member");
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to remove member";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error removing member:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update a member's role
  const updateMemberRole = async (
    projectId: string,
    userId: string,
    role: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateProjectMemberRole(projectId, userId, role);

      if (response.success) {
        // Refresh project members
        await fetchProjectMembers(projectId);

        toast.success("Member role updated successfully");
        return response.data;
      } else {
        setError(response.message || "Failed to update member role");
        toast.error(response.message || "Failed to update member role");
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update member role";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error updating member role:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new task
  const createNewTask = async (
    title: string,
    projectId: string,
    description?: string,
    status?: string,
    priority?: string,
    assignedTo?: string,
    dueDate?: string,
    parentId?: string,
    position?: number
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createTask({
        title,
        projectId,
        description,
        status,
        priority,
        assignedTo,
        dueDate,
        parentId,
        position,
      });

      if (response.success) {
        // Add to tasks list
        setTasks([response.data, ...tasks]);

        toast.success("Task created successfully");
        return response.data;
      } else {
        setError(response.message || "Failed to create task");
        toast.error(response.message || "Failed to create task");
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create task";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error creating task:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update a task
  const updateTaskDetails = async (
    id: string,
    title?: string,
    description?: string,
    status?: string,
    priority?: string,
    assignedTo?: string | null,
    dueDate?: string | null,
    position?: number
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateTask(id, {
        title,
        description,
        status,
        priority,
        assignedTo,
        dueDate,
        position,
      });

      if (response.success) {
        // Update tasks list
        setTasks(tasks.map((t) => (t.id === id ? response.data : t)));

        toast.success("Task updated successfully");
        return response.data;
      } else {
        setError(response.message || "Failed to update task");
        toast.error(response.message || "Failed to update task");
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update task";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error updating task:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a task
  const removeTask = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await deleteTask(id);

      if (response.success) {
        // Remove from tasks list
        setTasks(tasks.filter((t) => t.id !== id));

        toast.success("Task deleted successfully");
        return true;
      } else {
        setError(response.message || "Failed to delete task");
        toast.error(response.message || "Failed to delete task");
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete task";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error deleting task:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Archive or unarchive a task
  const toggleArchiveTask = async (id: string, archive: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const response = archive
        ? await archiveTask(id)
        : await unarchiveTask(id);

      if (response.success) {
        // Update tasks list
        setTasks(tasks.map((t) => (t.id === id ? response.data : t)));

        toast.success(
          `Task ${archive ? "archived" : "unarchived"} successfully`
        );
        return response.data;
      } else {
        setError(
          response.message ||
            `Failed to ${archive ? "archive" : "unarchive"} task`
        );
        toast.error(
          response.message ||
            `Failed to ${archive ? "archive" : "unarchive"} task`
        );
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.message || `Failed to ${archive ? "archive" : "unarchive"} task`;
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(
        `Error ${archive ? "archiving" : "unarchiving"} task:`,
        error
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new label
  const createNewLabel = async (
    projectId: string,
    name: string,
    color?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createTaskLabel(projectId, name, color);

      if (response.success) {
        // Add to labels list
        setLabels([response.data, ...labels]);

        toast.success("Label created successfully");
        return response.data;
      } else {
        setError(response.message || "Failed to create label");
        toast.error(response.message || "Failed to create label");
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create label";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error creating label:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Load projects when workspace changes
  useEffect(() => {
    if (activeWorkspace) {
      // Only fetch projects if we have an active workspace
      const loadProjects = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await getWorkspaceProjects(activeWorkspace.id);
          if (response.success) {
            setProjects(response.data);
          } else {
            setError(response.message || "Failed to fetch projects");
          }
        } catch (error: any) {
          setError(error.message || "Failed to fetch projects");
          console.error("Error fetching projects:", error);
        } finally {
          setLoading(false);
        }
      };

      loadProjects();
    }
  }, [activeWorkspace]);

  const value = {
    projects,
    activeProject,
    projectMembers,
    tasks,
    labels,
    loading,
    error,
    fetchProjects,
    fetchUserProjects,
    fetchProject,
    fetchProjectMembers,
    fetchTasks,
    fetchUserTasks,
    fetchLabels,
    setActiveProject,
    createNewProject,
    updateProjectDetails,
    removeProject,
    toggleArchiveProject,
    addMember,
    removeMember,
    updateMemberRole,
    createNewTask,
    updateTaskDetails,
    removeTask,
    toggleArchiveTask,
    createNewLabel,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
