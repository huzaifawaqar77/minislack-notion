-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  created_by UUID NOT NULL REFERENCES users(id),
  is_archived BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Create index on workspace_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_workspace_id ON projects(workspace_id);

-- Create index on created_by for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- owner, admin, member, guest
  invited_by UUID REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on project_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);

-- Create unique constraint on project_id and user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_members_unique ON project_members(project_id, user_id);

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'todo', -- todo, in_progress, completed
  priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, urgent
  project_id UUID NOT NULL REFERENCES projects(id),
  assigned_to UUID REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  position INTEGER DEFAULT 0, -- For ordering tasks within a status
  parent_id UUID REFERENCES project_tasks(id), -- For subtasks
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Create index on project_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);

-- Create index on assigned_to for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to ON project_tasks(assigned_to);

-- Create index on status for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);

-- Create index on parent_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_tasks_parent_id ON project_tasks(parent_id);

-- Create project_task_comments table
CREATE TABLE IF NOT EXISTS project_task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES project_tasks(id),
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Create index on task_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_task_comments_task_id ON project_task_comments(task_id);

-- Create project_files table
CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  file_id UUID NOT NULL REFERENCES files(id),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on project_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);

-- Create index on file_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_files_file_id ON project_files(file_id);

-- Create project_task_attachments table
CREATE TABLE IF NOT EXISTS project_task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES project_tasks(id),
  file_id UUID NOT NULL REFERENCES files(id),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on task_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_task_attachments_task_id ON project_task_attachments(task_id);

-- Create index on file_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_task_attachments_file_id ON project_task_attachments(file_id);

-- Create project_task_labels table
CREATE TABLE IF NOT EXISTS project_task_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  color VARCHAR(20) NOT NULL DEFAULT '#6366F1', -- Default indigo color
  project_id UUID NOT NULL REFERENCES projects(id),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on project_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_task_labels_project_id ON project_task_labels(project_id);

-- Create project_task_label_assignments table (junction table)
CREATE TABLE IF NOT EXISTS project_task_label_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES project_tasks(id),
  label_id UUID NOT NULL REFERENCES project_task_labels(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on task_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_task_label_assignments_task_id ON project_task_label_assignments(task_id);

-- Create index on label_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_task_label_assignments_label_id ON project_task_label_assignments(label_id);

-- Create unique constraint on task_id and label_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_task_label_assignments_unique ON project_task_label_assignments(task_id, label_id);

-- Create project_task_activity table
CREATE TABLE IF NOT EXISTS project_task_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES project_tasks(id),
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- created, updated, commented, assigned, completed, etc.
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on task_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_task_activity_task_id ON project_task_activity(task_id);

-- Add comments to tables
COMMENT ON TABLE projects IS 'Stores project information';
COMMENT ON TABLE project_members IS 'Stores project member information';
COMMENT ON TABLE project_tasks IS 'Stores project task information';
COMMENT ON TABLE project_task_comments IS 'Stores comments on project tasks';
COMMENT ON TABLE project_files IS 'Stores files associated with projects';
COMMENT ON TABLE project_task_attachments IS 'Stores files attached to project tasks';
COMMENT ON TABLE project_task_labels IS 'Stores labels for project tasks';
COMMENT ON TABLE project_task_label_assignments IS 'Stores assignments of labels to tasks';
COMMENT ON TABLE project_task_activity IS 'Stores activity history for project tasks';
