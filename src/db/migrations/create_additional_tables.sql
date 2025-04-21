-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  workspace_id UUID REFERENCES workspaces(id),
  channel_id UUID REFERENCES channels(id),
  message_id UUID REFERENCES messages(id),
  sender_id UUID REFERENCES users(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Create index on is_read for faster filtering
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Create index on type for faster filtering
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Create index on workspace_id for faster filtering
CREATE INDEX IF NOT EXISTS idx_notifications_workspace_id ON notifications(workspace_id);

-- Create index on channel_id for faster filtering
CREATE INDEX IF NOT EXISTS idx_notifications_channel_id ON notifications(channel_id);

-- Comment on table
COMMENT ON TABLE notifications IS 'Stores user notifications';

-- Add is_online column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;

-- Add last_seen column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP;
