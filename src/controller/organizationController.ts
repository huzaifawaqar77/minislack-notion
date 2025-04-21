import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import * as organizationRepository from "../repositories/organizationRepository";

/**
 * Creates a new organization
 */
export async function createOrganizationController(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, description, logoUrl, faviconUrl, primaryColor, secondaryColor } = req.body;
    
    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Organization name is required"
      });
    }
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const organization = await organizationRepository.createOrganization({
      name,
      description,
      logoUrl,
      faviconUrl,
      primaryColor,
      secondaryColor,
      createdBy: req.user.id
    });
    
    return res.status(201).json({
      status: "success",
      data: organization
    });
  } catch (error: any) {
    console.error("Error creating organization:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to create organization"
    });
  }
}

/**
 * Gets an organization by ID
 */
export async function getOrganizationController(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    
    const organization = await organizationRepository.getOrganizationById(id);
    
    if (!organization) {
      return res.status(404).json({
        status: "error",
        message: "Organization not found"
      });
    }
    
    return res.status(200).json({
      status: "success",
      data: organization
    });
  } catch (error: any) {
    console.error("Error getting organization:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get organization"
    });
  }
}

/**
 * Updates an organization
 */
export async function updateOrganizationController(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, logoUrl, faviconUrl, primaryColor, secondaryColor } = req.body;
    
    const organization = await organizationRepository.updateOrganization(id, {
      name,
      description,
      logoUrl,
      faviconUrl,
      primaryColor,
      secondaryColor
    });
    
    return res.status(200).json({
      status: "success",
      data: organization
    });
  } catch (error: any) {
    console.error("Error updating organization:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to update organization"
    });
  }
}

/**
 * Adds a domain to an organization
 */
export async function addDomainController(req: AuthenticatedRequest, res: Response) {
  try {
    const { organizationId } = req.params;
    const { domain, isPrimary } = req.body;
    
    if (!domain) {
      return res.status(400).json({
        status: "error",
        message: "Domain is required"
      });
    }
    
    const domainRecord = await organizationRepository.addOrganizationDomain({
      organizationId,
      domain,
      isPrimary
    });
    
    return res.status(201).json({
      status: "success",
      data: domainRecord,
      message: "Domain added successfully. Please verify ownership."
    });
  } catch (error: any) {
    console.error("Error adding domain:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to add domain"
    });
  }
}

/**
 * Gets all domains for an organization
 */
export async function getDomainsController(req: AuthenticatedRequest, res: Response) {
  try {
    const { organizationId } = req.params;
    
    const domains = await organizationRepository.getOrganizationDomains(organizationId);
    
    return res.status(200).json({
      status: "success",
      data: domains
    });
  } catch (error: any) {
    console.error("Error getting domains:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get domains"
    });
  }
}

/**
 * Verifies a domain
 */
export async function verifyDomainController(req: Request, res: Response) {
  try {
    const { domainId, token } = req.query;
    
    if (!domainId || !token || typeof domainId !== 'string' || typeof token !== 'string') {
      return res.status(400).json({
        status: "error",
        message: "Domain ID and verification token are required"
      });
    }
    
    const verified = await organizationRepository.verifyDomain(domainId, token);
    
    if (!verified) {
      return res.status(400).json({
        status: "error",
        message: "Invalid verification token"
      });
    }
    
    return res.status(200).json({
      status: "success",
      message: "Domain verified successfully"
    });
  } catch (error: any) {
    console.error("Error verifying domain:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to verify domain"
    });
  }
}

/**
 * Updates organization settings
 */
export async function updateSettingsController(req: AuthenticatedRequest, res: Response) {
  try {
    const { organizationId } = req.params;
    const { 
      emailFromName, 
      emailTemplate, 
      customCss, 
      customJs, 
      allowPublicSignup, 
      requireEmailVerification 
    } = req.body;
    
    const settings = await organizationRepository.updateOrganizationSettings(
      organizationId,
      {
        emailFromName,
        emailTemplate,
        customCss,
        customJs,
        allowPublicSignup,
        requireEmailVerification
      }
    );
    
    return res.status(200).json({
      status: "success",
      data: settings
    });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to update settings"
    });
  }
}

/**
 * Gets organization settings
 */
export async function getSettingsController(req: AuthenticatedRequest, res: Response) {
  try {
    const { organizationId } = req.params;
    
    const settings = await organizationRepository.getOrganizationSettings(organizationId);
    
    if (!settings) {
      return res.status(404).json({
        status: "error",
        message: "Settings not found"
      });
    }
    
    return res.status(200).json({
      status: "success",
      data: settings
    });
  } catch (error: any) {
    console.error("Error getting settings:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get settings"
    });
  }
}
