-- Create workspace_invitations table
CREATE TABLE IF NOT EXISTS workspace_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  invited_by UUID NOT NULL REFERENCES users(id),
  role VARCHAR(50) DEFAULT 'member',
  token VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_email ON workspace_invitations(email);

-- Create index on token for faster lookups
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_token ON workspace_invitations(token);

-- Create index on workspace_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_workspace_id ON workspace_invitations(workspace_id);

-- Create webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  events JSONB NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  created_by UUID NOT NULL REFERENCES users(id),
  secret VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on workspace_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_webhooks_workspace_id ON webhooks(workspace_id);

-- Add owner role to workspace_members
ALTER TABLE workspace_members
  ALTER COLUMN role TYPE VARCHAR(50);

-- Update existing admin roles to owner for workspace creators
UPDATE workspace_members
SET role = 'owner'
WHERE role = 'admin'
AND user_id IN (
  SELECT created_by FROM workspaces WHERE id = workspace_members.workspace_id
);

-- Comment on tables
COMMENT ON TABLE workspace_invitations IS 'Stores workspace invitation information';
COMMENT ON TABLE webhooks IS 'Stores webhook configuration for workspaces';
