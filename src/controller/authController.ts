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
import { createCsrfToken } from "../repositories/csrfRepository";
import {
  isAccountLocked,
  trackFailedLoginAttempt,
  clearFailedLoginAttempts,
} from "../services/securityService";

export async function loginController(req: Request, res: Response) {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    return res.status(401).json({
      status: "error",
      message: "Username or password is required",
    });
  }

  try {
    // Check if account is locked due to too many failed attempts
    const locked = await isAccountLocked(usernameOrEmail);
    if (locked) {
      return res.status(429).json({
        status: "error",
        message:
          "Account temporarily locked due to too many failed login attempts. Please try again later.",
      });
    }

    // Get device information from user agent
    const userAgent = req.headers["user-agent"] || "";
    const deviceInfo = parseUserAgent(userAgent);

    // Get client IP address
    const ipAddress = getClientIp(req);

    try {
      // Login with device info and IP address
      const loginResult = await loginUser(
        usernameOrEmail,
        password,
        deviceInfo,
        ipAddress
      );

      if (!loginResult) {
        // This shouldn't happen as loginUser should throw an error if login fails
        throw new Error("Authentication failed");
      }

      // Clear failed login attempts on successful login
      await clearFailedLoginAttempts(usernameOrEmail);

      // Generate CSRF token for the user
      const csrfToken = await createCsrfToken(loginResult.user.id);

      res.status(200).json({
        status: "success",
        user: loginResult.user,
        token: loginResult.token,
        csrfToken,
      });
    } catch (loginError) {
      // Track failed login attempt
      const shouldLock = await trackFailedLoginAttempt(
        usernameOrEmail,
        ipAddress
      );

      if (shouldLock) {
        return res.status(429).json({
          status: "error",
          message:
            "Account temporarily locked due to too many failed login attempts. Please try again later.",
        });
      }

      throw loginError;
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({
      status: "error",
      message: error instanceof Error ? error.message : "Authentication failed",
    });
  }
}

export const registerController = async (req: DomainRequest, res: Response) => {
  const { email, username, password, firstName, lastName, timezone } = req.body;

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
      branding,
      timezone
    );

    // Generate CSRF token for the new user
    const csrfToken = await createCsrfToken(registerResult.id);

    return res.status(200).json({
      status: "success",
      user: registerResult,
      csrfToken,
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

    // Generate CSRF token for the user
    const csrfToken = await createCsrfToken(user.id);

    return res.status(200).json({
      status: "success",
      user,
      token,
      csrfToken,
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
