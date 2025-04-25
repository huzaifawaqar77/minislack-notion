import { apiClient } from "./apiClient";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  project_id: string;
  assigned_to: string | null;
  due_date: string | null;
  parent_id: string | null;
  position: number;
  is_archived: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface TaskComment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

export interface TaskActivity {
  id: string;
  action: string;
  details: any;
  created_at: string;
  user_id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  projectId: string;
  assignedTo?: string;
  dueDate?: string;
  parentId?: string;
  position?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedTo?: string | null;
  dueDate?: string | null;
  position?: number;
}

// Task API functions
export const createTask = async (input: CreateTaskInput) => {
  const response = await apiClient.post("/projects/tasks", input);
  return response.data;
};

export const getTask = async (id: string) => {
  const response = await apiClient.get(`/projects/tasks/${id}`);
  return response.data;
};

export const getProjectTasks = async (projectId: string) => {
  const response = await apiClient.get(`/projects/${projectId}/tasks`);
  return response.data;
};

export const getUserTasks = async () => {
  const response = await apiClient.get("/projects/tasks/user");
  return response.data;
};

export const updateTask = async (id: string, input: UpdateTaskInput) => {
  const response = await apiClient.put(`/projects/tasks/${id}`, input);
  return response.data;
};

export const deleteTask = async (id: string) => {
  const response = await apiClient.delete(`/projects/tasks/${id}`);
  return response.data;
};

export const archiveTask = async (id: string) => {
  const response = await apiClient.put(`/projects/tasks/${id}/archive`);
  return response.data;
};

export const unarchiveTask = async (id: string) => {
  const response = await apiClient.put(`/projects/tasks/${id}/unarchive`);
  return response.data;
};

// Task activity and comments API functions
export const getTaskActivity = async (id: string) => {
  const response = await apiClient.get(`/projects/tasks/${id}/activity`);
  return response.data;
};

export const createTaskComment = async (id: string, content: string) => {
  const response = await apiClient.post(`/projects/tasks/${id}/comments`, {
    content,
  });
  return response.data;
};

export const getTaskComments = async (id: string) => {
  const response = await apiClient.get(`/projects/tasks/${id}/comments`);
  return response.data;
};

// Task labels API functions
export const createTaskLabel = async (
  projectId: string,
  name: string,
  color?: string
) => {
  const response = await apiClient.post(`/projects/${projectId}/labels`, {
    name,
    color,
  });
  return response.data;
};

export const getProjectLabels = async (projectId: string) => {
  const response = await apiClient.get(`/projects/${projectId}/labels`);
  return response.data;
};

export const assignLabelToTask = async (taskId: string, labelId: string) => {
  const response = await apiClient.post(
    `/projects/tasks/${taskId}/labels/${labelId}`
  );
  return response.data;
};

export const removeLabelFromTask = async (taskId: string, labelId: string) => {
  const response = await apiClient.delete(
    `/projects/tasks/${taskId}/labels/${labelId}`
  );
  return response.data;
};

export const getTaskLabels = async (taskId: string) => {
  const response = await apiClient.get(`/projects/tasks/${taskId}/labels`);
  return response.data;
};
