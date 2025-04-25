import { apiClient } from "./apiClient";

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_archived: boolean;
  is_public: boolean;
  workspace_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  membership_id: string;
  user_id: string;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: string;
  joined_at: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  imageUrl?: string;
  isPublic?: boolean;
  workspaceId: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  imageUrl?: string;
  isPublic?: boolean;
}

// Project API functions
export const createProject = async (input: CreateProjectInput) => {
  const response = await apiClient.post("/projects", input);
  return response.data;
};

export const getProject = async (id: string) => {
  const response = await apiClient.get(`/projects/${id}`);
  return response.data;
};

export const getWorkspaceProjects = async (workspaceId: string) => {
  const response = await apiClient.get(`/projects/workspace/${workspaceId}`);
  return response.data;
};

export const getUserProjects = async () => {
  const response = await apiClient.get("/projects/user");
  return response.data;
};

export const updateProject = async (id: string, input: UpdateProjectInput) => {
  const response = await apiClient.put(`/projects/${id}`, input);
  return response.data;
};

export const deleteProject = async (id: string) => {
  const response = await apiClient.delete(`/projects/${id}`);
  return response.data;
};

export const archiveProject = async (id: string) => {
  const response = await apiClient.put(`/projects/${id}/archive`);
  return response.data;
};

export const unarchiveProject = async (id: string) => {
  const response = await apiClient.put(`/projects/${id}/unarchive`);
  return response.data;
};

// Project members API functions
export const getProjectMembers = async (id: string) => {
  const response = await apiClient.get(`/projects/${id}/members`);
  return response.data;
};

export const addProjectMember = async (
  id: string,
  userId: string,
  role?: string
) => {
  const response = await apiClient.post(`/projects/${id}/members`, {
    userId,
    role,
  });
  return response.data;
};

export const removeProjectMember = async (id: string, userId: string) => {
  const response = await apiClient.delete(`/projects/${id}/members/${userId}`);
  return response.data;
};

export const updateProjectMemberRole = async (
  id: string,
  userId: string,
  role: string
) => {
  const response = await apiClient.put(`/projects/${id}/members/${userId}/role`, {
    role,
  });
  return response.data;
};
