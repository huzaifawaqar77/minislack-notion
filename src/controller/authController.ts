import { Request, Response } from "express";
import {
  loginUser,
  registerUser,
  getUserById,
} from "../repositories/userRepository";
import { parseUserAgent, getClientIp } from "../utils/deviceInfo";
import { DomainRequest } from "../middleware/domainMiddleware";
import { getOrganizationSettings } from "../repositories/organizationRepository";
import { OrganizationBranding } from "../services/emailService";
import { verifyToken } from "../middleware/authMiddleware";

export function loginController(req: Request, res: Response) {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    return res.status(401).send("Username or password is required");
  }

  try {
    // Get device information from user agent
    const userAgent = req.headers["user-agent"] || "";
    const deviceInfo = parseUserAgent(userAgent);

    // Get client IP address
    const ipAddress = getClientIp(req);

    // Login with device info and IP address
    const loginResult = loginUser(
      usernameOrEmail,
      password,
      deviceInfo,
      ipAddress
    );
    if (!loginResult) {
      return res.status(401).send("Username or password is required");
    }

    res.status(200).json({
      status: "success",
      user: loginResult,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({
      status: "error",
      message: error instanceof Error ? error.message : "Authentication failed",
    });
  }
}

export const registerController = async (req: DomainRequest, res: Response) => {
  const { email, username, password, firstName, lastName } = req.body;

  console.log(req.body, "request ");
  if (!username || !password || !email || !firstName || !lastName) {
    return res.status(401).json({
      status: "error",
      message: "You must fill all fields in order to register",
    });
  }

  try {
    // Check if we're in an organization context
    let organizationId: string | undefined;
    let branding: OrganizationBranding | undefined;

    if (req.organization) {
      organizationId = req.organization.id;

      // Get organization settings
      const settings = await getOrganizationSettings(organizationId);

      // Check if public signup is allowed
      if (settings && settings.allow_public_signup === false) {
        return res.status(403).json({
          status: "error",
          message: "Public registration is not allowed for this organization",
        });
      }

      // Create branding object for email
      branding = {
        name: req.organization.name,
        logoUrl: req.organization.logoUrl,
        primaryColor: req.organization.primaryColor,
        secondaryColor: req.organization.secondaryColor,
        emailFromName: settings?.email_from_name || req.organization.name,
      };
    }

    const registerResult = await registerUser(
      email,
      username,
      password,
      firstName,
      lastName,
      true, // Send verification email
      organizationId,
      branding
    );

    return res.status(200).json({
      status: "success",
      user: registerResult,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(400).json({
      status: "error",
      message: error instanceof Error ? error.message : "Registration failed",
    });
  }
};

/**
 * Handles OAuth success
 */
export const oauthSuccessController = async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      status: "error",
      message: "Token is required",
    });
  }

  try {
    // Verify the token
    const decoded = verifyToken(token as string);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
    }

    // Get the user
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      user,
      token,
    });
  } catch (error) {
    console.error("OAuth success error:", error);
    return res.status(401).json({
      status: "error",
      message: error instanceof Error ? error.message : "Authentication failed",
    });
  }
};

/**
 * Handles OAuth error
 */
export const oauthErrorController = (req: Request, res: Response) => {
  const { provider } = req.query;

  return res.status(401).json({
    status: "error",
    message: `Authentication with ${provider || "OAuth provider"} failed`,
  });
};
