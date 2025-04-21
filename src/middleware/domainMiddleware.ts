import { Request, Response, NextFunction } from "express";
import { getOrganizationByDomain } from "../repositories/organizationRepository";
import { extractDomain } from "../utils/stringUtils";

/**
 * Extended request interface with organization information
 */
export interface DomainRequest extends Request {
  organization?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

/**
 * Middleware to detect the current domain and load the appropriate organization
 */
export async function detectDomain(req: DomainRequest, res: Response, next: NextFunction) {
  try {
    // Get the host from the request
    const host = req.headers.host || '';
    
    // Extract the domain
    const domain = extractDomain(host);
    
    // Skip for localhost or IP addresses during development
    if (domain === 'localhost' || /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(domain)) {
      // For development, you might want to set a default organization or skip
      return next();
    }
    
    // Look up the organization by domain
    const organization = await getOrganizationByDomain(domain);
    
    if (organization) {
      // Attach the organization to the request
      req.organization = {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logoUrl: organization.logo_url || undefined,
        faviconUrl: organization.favicon_url || undefined,
        primaryColor: organization.primary_color || undefined,
        secondaryColor: organization.secondary_color || undefined,
      };
    }
    
    next();
  } catch (error) {
    console.error('Error detecting domain:', error);
    // Continue even if there's an error
    next();
  }
}

/**
 * Middleware to require an organization context
 */
export function requireOrganization(req: DomainRequest, res: Response, next: NextFunction) {
  if (!req.organization) {
    return res.status(404).json({
      status: 'error',
      message: 'Organization not found for this domain'
    });
  }
  
  next();
}
