-- Create failed_login_attempts table
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username_or_email VARCHAR(255) NOT NULL,
  ip_hash VARCHAR(255) NOT NULL,
  attempted_at TIMESTAMP NOT NULL
);

-- Create index on username_or_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_username_or_email ON failed_login_attempts(username_or_email);

-- Create index on ip_hash for faster lookups
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_ip_hash ON failed_login_attempts(ip_hash);

-- Create index on attempted_at for faster lookups
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_attempted_at ON failed_login_attempts(attempted_at);

-- Create security_events table for logging suspicious activity
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  ip_address VARCHAR(255),
  user_agent TEXT,
  user_id UUID REFERENCES users(id),
  request_path VARCHAR(255),
  request_method VARCHAR(10),
  request_data JSONB,
  created_at TIMESTAMP NOT NULL
);

-- Create index on event_type for faster lookups
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);

-- Create index on ip_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON security_events(ip_address);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);

-- Create index on created_at for faster lookups
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);

-- Create csrf_tokens table
CREATE TABLE IF NOT EXISTS csrf_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL
);

-- Create index on token for faster lookups
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_token ON csrf_tokens(token);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_user_id ON csrf_tokens(user_id);

-- Create index on expires_at for faster lookups
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_expires_at ON csrf_tokens(expires_at);

-- Comment on tables
COMMENT ON TABLE failed_login_attempts IS 'Stores failed login attempts for rate limiting and account locking';
COMMENT ON TABLE security_events IS 'Stores security-related events for auditing and monitoring';
COMMENT ON TABLE csrf_tokens IS 'Stores CSRF tokens for form submissions';
