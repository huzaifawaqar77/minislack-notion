import { db } from "../db/database";
import crypto from "crypto";
import { Organizations, OrganizationDomains, OrganizationSettings } from "../types/databaseTypes";
import { slugify } from "../utils/stringUtils";

/**
 * Interface for organization creation
 */
export interface CreateOrganizationInput {
  name: string;
  description?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  createdBy: string; // User ID
}

/**
 * Interface for organization domain creation
 */
export interface CreateDomainInput {
  organizationId: string;
  domain: string;
  isPrimary?: boolean;
}

/**
 * Interface for organization settings
 */
export interface OrganizationSettingsInput {
  emailFromName?: string;
  emailTemplate?: string;
  customCss?: string;
  customJs?: string;
  allowPublicSignup?: boolean;
  requireEmailVerification?: boolean;
}

/**
 * Creates a new organization
 * 
 * @param input - Organization creation input
 * @returns The created organization
 */
export async function createOrganization(input: CreateOrganizationInput) {
  // Generate a slug from the name
  const slug = slugify(input.name);
  
  // Check if slug already exists
  const existingOrg = await db
    .selectFrom("organizations")
    .select(["id"])
    .where("slug", "=", slug)
    .executeTakeFirst();
  
  if (existingOrg) {
    throw new Error(`Organization with slug '${slug}' already exists`);
  }
  
  // Create the organization
  const organizationId = crypto.randomUUID();
  
  const organization = await db
    .insertInto("organizations")
    .values({
      id: organizationId,
      name: input.name,
      slug,
      description: input.description || null,
      logo_url: input.logoUrl || null,
      favicon_url: input.faviconUrl || null,
      primary_color: input.primaryColor || '#10b981', // Default emerald
      secondary_color: input.secondaryColor || '#18181b', // Default dark zinc
      created_by: input.createdBy,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  
  // Create default settings for the organization
  await db
    .insertInto("organization_settings")
    .values({
      id: crypto.randomUUID(),
      organization_id: organizationId,
      email_from_name: input.name,
      email_template: 'default',
      allow_public_signup: true,
      require_email_verification: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .execute();
  
  return organization;
}

/**
 * Adds a domain to an organization
 * 
 * @param input - Domain creation input
 * @returns The created domain
 */
export async function addOrganizationDomain(input: CreateDomainInput) {
  // Check if domain already exists
  const existingDomain = await db
    .selectFrom("organization_domains")
    .select(["id"])
    .where("domain", "=", input.domain)
    .executeTakeFirst();
  
  if (existingDomain) {
    throw new Error(`Domain '${input.domain}' is already registered`);
  }
  
  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // If this is the first domain and isPrimary is not specified, make it primary
  let isPrimary = input.isPrimary || false;
  
  if (!isPrimary) {
    const existingDomains = await db
      .selectFrom("organization_domains")
      .select(["id"])
      .where("organization_id", "=", input.organizationId)
      .execute();
    
    if (existingDomains.length === 0) {
      isPrimary = true;
    }
  }
  
  // If setting this domain as primary, unset any existing primary domains
  if (isPrimary) {
    await db
      .updateTable("organization_domains")
      .set({ is_primary: false })
      .where("organization_id", "=", input.organizationId)
      .where("is_primary", "=", true)
      .execute();
  }
  
  // Create the domain
  const domain = await db
    .insertInto("organization_domains")
    .values({
      id: crypto.randomUUID(),
      organization_id: input.organizationId,
      domain: input.domain,
      is_primary: isPrimary,
      is_verified: false,
      verification_token: verificationToken,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  
  return domain;
}

/**
 * Updates organization settings
 * 
 * @param organizationId - The ID of the organization
 * @param settings - The settings to update
 * @returns The updated settings
 */
export async function updateOrganizationSettings(
  organizationId: string,
  settings: OrganizationSettingsInput
) {
  // Check if settings exist
  const existingSettings = await db
    .selectFrom("organization_settings")
    .selectAll()
    .where("organization_id", "=", organizationId)
    .executeTakeFirst();
  
  if (!existingSettings) {
    // Create settings if they don't exist
    return db
      .insertInto("organization_settings")
      .values({
        id: crypto.randomUUID(),
        organization_id: organizationId,
        email_from_name: settings.emailFromName || null,
        email_template: settings.emailTemplate || 'default',
        custom_css: settings.customCss || null,
        custom_js: settings.customJs || null,
        allow_public_signup: settings.allowPublicSignup !== undefined ? settings.allowPublicSignup : true,
        require_email_verification: settings.requireEmailVerification !== undefined ? settings.requireEmailVerification : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }
  
  // Update existing settings
  return db
    .updateTable("organization_settings")
    .set({
      email_from_name: settings.emailFromName !== undefined ? settings.emailFromName : existingSettings.email_from_name,
      email_template: settings.emailTemplate !== undefined ? settings.emailTemplate : existingSettings.email_template,
      custom_css: settings.customCss !== undefined ? settings.customCss : existingSettings.custom_css,
      custom_js: settings.customJs !== undefined ? settings.customJs : existingSettings.custom_js,
      allow_public_signup: settings.allowPublicSignup !== undefined ? settings.allowPublicSignup : existingSettings.allow_public_signup,
      require_email_verification: settings.requireEmailVerification !== undefined ? settings.requireEmailVerification : existingSettings.require_email_verification,
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", existingSettings.id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Gets an organization by ID
 * 
 * @param id - The ID of the organization
 * @returns The organization or null if not found
 */
export async function getOrganizationById(id: string) {
  return db
    .selectFrom("organizations")
    .selectAll()
    .where("id", "=", id)
    .where("is_active", "=", true)
    .executeTakeFirst();
}

/**
 * Gets an organization by slug
 * 
 * @param slug - The slug of the organization
 * @returns The organization or null if not found
 */
export async function getOrganizationBySlug(slug: string) {
  return db
    .selectFrom("organizations")
    .selectAll()
    .where("slug", "=", slug)
    .where("is_active", "=", true)
    .executeTakeFirst();
}

/**
 * Gets an organization by domain
 * 
 * @param domain - The domain to look up
 * @returns The organization or null if not found
 */
export async function getOrganizationByDomain(domain: string) {
  const domainRecord = await db
    .selectFrom("organization_domains")
    .selectAll()
    .where("domain", "=", domain)
    .executeTakeFirst();
  
  if (!domainRecord) {
    return null;
  }
  
  return db
    .selectFrom("organizations")
    .selectAll()
    .where("id", "=", domainRecord.organization_id)
    .where("is_active", "=", true)
    .executeTakeFirst();
}

/**
 * Gets organization settings
 * 
 * @param organizationId - The ID of the organization
 * @returns The organization settings or null if not found
 */
export async function getOrganizationSettings(organizationId: string) {
  return db
    .selectFrom("organization_settings")
    .selectAll()
    .where("organization_id", "=", organizationId)
    .executeTakeFirst();
}

/**
 * Gets all domains for an organization
 * 
 * @param organizationId - The ID of the organization
 * @returns Array of domains
 */
export async function getOrganizationDomains(organizationId: string) {
  return db
    .selectFrom("organization_domains")
    .selectAll()
    .where("organization_id", "=", organizationId)
    .execute();
}

/**
 * Verifies a domain
 * 
 * @param domainId - The ID of the domain
 * @param token - The verification token
 * @returns True if verification was successful, false otherwise
 */
export async function verifyDomain(domainId: string, token: string) {
  const domain = await db
    .selectFrom("organization_domains")
    .selectAll()
    .where("id", "=", domainId)
    .where("verification_token", "=", token)
    .executeTakeFirst();
  
  if (!domain) {
    return false;
  }
  
  await db
    .updateTable("organization_domains")
    .set({
      is_verified: true,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", domainId)
    .execute();
  
  return true;
}

/**
 * Updates an organization
 * 
 * @param id - The ID of the organization
 * @param updates - The fields to update
 * @returns The updated organization
 */
export async function updateOrganization(
  id: string,
  updates: Partial<CreateOrganizationInput>
) {
  const organization = await db
    .selectFrom("organizations")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
  
  if (!organization) {
    throw new Error(`Organization with ID '${id}' not found`);
  }
  
  return db
    .updateTable("organizations")
    .set({
      name: updates.name !== undefined ? updates.name : organization.name,
      description: updates.description !== undefined ? updates.description : organization.description,
      logo_url: updates.logoUrl !== undefined ? updates.logoUrl : organization.logo_url,
      favicon_url: updates.faviconUrl !== undefined ? updates.faviconUrl : organization.favicon_url,
      primary_color: updates.primaryColor !== undefined ? updates.primaryColor : organization.primary_color,
      secondary_color: updates.secondaryColor !== undefined ? updates.secondaryColor : organization.secondary_color,
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}
