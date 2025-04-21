-- Create organizations table for white-labeling
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  logo_url VARCHAR(255),
  favicon_url VARCHAR(255),
  primary_color VARCHAR(20) DEFAULT '#10b981', -- Default emerald color
  secondary_color VARCHAR(20) DEFAULT '#18181b', -- Default dark zinc color
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  max_workspaces INTEGER,
  max_users_per_workspace INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- Create organization_domains table for custom domains
CREATE TABLE IF NOT EXISTS organization_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  domain VARCHAR(255) NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on domain for faster lookups
CREATE INDEX IF NOT EXISTS idx_organization_domains_domain ON organization_domains(domain);

-- Create organization_settings table for additional settings
CREATE TABLE IF NOT EXISTS organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) UNIQUE,
  email_from_name VARCHAR(100),
  email_template VARCHAR(50) DEFAULT 'default',
  custom_css TEXT,
  custom_js TEXT,
  allow_public_signup BOOLEAN DEFAULT TRUE,
  require_email_verification BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add organization_id to workspaces table
ALTER TABLE workspaces 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Create index on organization_id in workspaces
CREATE INDEX IF NOT EXISTS idx_workspaces_organization_id ON workspaces(organization_id);

-- Comment on tables
COMMENT ON TABLE organizations IS 'Stores organization information for white-labeling';
COMMENT ON TABLE organization_domains IS 'Stores custom domains for organizations';
COMMENT ON TABLE organization_settings IS 'Stores additional settings for organizations';
