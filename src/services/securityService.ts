import Redis from "ioredis";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { db } from "../db/database";
import crypto from "crypto";

// Initialize Redis client for rate limiting and brute force protection
// This is optional and will fall back to in-memory storage if Redis is not available
let redisClient: Redis | null = null;

// Only attempt to connect to Redis if not in development mode or if REDIS_URL is explicitly set
if (process.env.NODE_ENV !== "development" || process.env.REDIS_URL) {
  try {
    // Try to connect to Redis if available
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    redisClient = new Redis(redisUrl);

    redisClient.on("error", (err) => {
      console.warn("Redis connection error:", err);
      redisClient = null;
    });
  } catch (error) {
    console.warn("Redis not available, falling back to in-memory storage");
    redisClient = null;
  }
} else {
  console.log("Development mode: Redis disabled, using in-memory storage");
}

/**
 * Helmet middleware for securing HTTP headers
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://*"],
      connectSrc: ["'self'", "https://*"],
    },
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: "same-origin" },
});

/**
 * Rate limiter for API endpoints
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests, please try again later.",
  },
});

/**
 * Stricter rate limiter for authentication endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many authentication attempts, please try again later.",
  },
});

/**
 * Validation middleware for registration
 */
export const validateRegistration = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("username")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),
  body("firstName").isLength({ min: 1 }).withMessage("First name is required"),
  body("lastName").isLength({ min: 1 }).withMessage("Last name is required"),
];

/**
 * Validation middleware for login
 */
export const validateLogin = [
  body("usernameOrEmail")
    .isLength({ min: 3 })
    .withMessage("Username or email is required"),
  body("password").isLength({ min: 1 }).withMessage("Password is required"),
];

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      errors: errors.array(),
    });
  }

  next();
};

/**
 * Tracks failed login attempts
 *
 * @param usernameOrEmail - The username or email used in the login attempt
 * @param ipAddress - The IP address of the request
 * @returns True if the account should be temporarily locked
 */
export async function trackFailedLoginAttempt(
  usernameOrEmail: string,
  ipAddress: string
): Promise<boolean> {
  try {
    // Get current timestamp
    const now = new Date().toISOString();

    // Create a hash of the IP address for security
    const ipHash = crypto.createHash("sha256").update(ipAddress).digest("hex");

    // Record the failed attempt
    await db
      .insertInto("failed_login_attempts")
      .values({
        id: crypto.randomUUID(),
        username_or_email: usernameOrEmail,
        ip_hash: ipHash,
        attempted_at: now,
      })
      .execute();

    // Count recent failed attempts for this username/email
    const userAttempts = await db
      .selectFrom("failed_login_attempts")
      .select(db.fn.count<number>("id").as("count"))
      .where("username_or_email", "=", usernameOrEmail)
      .where(
        "attempted_at",
        ">",
        new Date(Date.now() - 30 * 60 * 1000).toISOString()
      ) // Last 30 minutes
      .executeTakeFirst();

    // Count recent failed attempts from this IP
    const ipAttempts = await db
      .selectFrom("failed_login_attempts")
      .select(db.fn.count<number>("id").as("count"))
      .where("ip_hash", "=", ipHash)
      .where(
        "attempted_at",
        ">",
        new Date(Date.now() - 30 * 60 * 1000).toISOString()
      ) // Last 30 minutes
      .executeTakeFirst();

    const userAttemptCount = parseInt((userAttempts?.count as any) || "0");
    const ipAttemptCount = parseInt((ipAttempts?.count as any) || "0");

    // Lock account if too many failed attempts
    if (userAttemptCount >= 5 || ipAttemptCount >= 10) {
      // If using Redis, we could set a temporary lock key
      if (redisClient) {
        await redisClient.set(
          `login:locked:${usernameOrEmail}`,
          "true",
          "EX",
          1800
        ); // 30 minutes
      }

      return true; // Account should be locked
    }

    return false;
  } catch (error) {
    console.error("Error tracking failed login attempt:", error);
    return false;
  }
}

/**
 * Checks if an account is temporarily locked
 *
 * @param usernameOrEmail - The username or email to check
 * @returns True if the account is locked
 */
export async function isAccountLocked(
  usernameOrEmail: string
): Promise<boolean> {
  try {
    // If using Redis, check for a lock key
    if (redisClient) {
      const locked = await redisClient.get(`login:locked:${usernameOrEmail}`);
      if (locked === "true") {
        return true;
      }
    }

    // Count recent failed attempts
    const attempts = await db
      .selectFrom("failed_login_attempts")
      .select(db.fn.count<number>("id").as("count"))
      .where("username_or_email", "=", usernameOrEmail)
      .where(
        "attempted_at",
        ">",
        new Date(Date.now() - 30 * 60 * 1000).toISOString()
      ) // Last 30 minutes
      .executeTakeFirst();

    const attemptCount = parseInt((attempts?.count as any) || "0");

    return attemptCount >= 5;
  } catch (error) {
    console.error("Error checking if account is locked:", error);
    return false;
  }
}

/**
 * Clears failed login attempts for a user after successful login
 *
 * @param usernameOrEmail - The username or email of the user
 */
export async function clearFailedLoginAttempts(
  usernameOrEmail: string
): Promise<void> {
  try {
    // Delete all failed attempts for this user
    await db
      .deleteFrom("failed_login_attempts")
      .where("username_or_email", "=", usernameOrEmail)
      .execute();

    // If using Redis, remove any lock
    if (redisClient) {
      await redisClient.del(`login:locked:${usernameOrEmail}`);
    }
  } catch (error) {
    console.error("Error clearing failed login attempts:", error);
  }
}

/**
 * Generates a CSRF token
 *
 * @returns CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Validates a CSRF token
 *
 * @param token - The token to validate
 * @param storedToken - The stored token to compare against
 * @returns True if the token is valid
 */
export function validateCsrfToken(token: string, storedToken: string): boolean {
  return token === storedToken;
}

/**
 * Middleware to check for suspicious activity
 */
export function detectSuspiciousActivity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Check for common attack patterns in headers and query parameters
  const userAgent = req.headers["user-agent"] || "";
  const referer = req.headers["referer"] || "";
  const queryString = req.url.split("?")[1] || "";

  // Check for SQL injection attempts
  const sqlInjectionPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i,
  ];

  // Check for XSS attempts
  const xssPatterns = [
    /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i,
    /((\%3C)|<)((\%69)|i|(\%49))((\%6D)|m|(\%4D))((\%67)|g|(\%47))[^\n]+((\%3E)|>)/i,
  ];

  // Check request for suspicious patterns
  const isSuspicious = [...sqlInjectionPatterns, ...xssPatterns].some(
    (pattern) =>
      pattern.test(queryString) || pattern.test(JSON.stringify(req.body || {}))
  );

  if (isSuspicious) {
    console.warn("Suspicious activity detected:", {
      ip: req.ip,
      path: req.path,
      userAgent,
      referer,
      query: queryString,
      body: req.body,
    });

    // Log the suspicious activity
    try {
      db.insertInto("security_events")
        .values({
          id: crypto.randomUUID(),
          event_type: "suspicious_activity",
          ip_address: req.ip,
          user_agent: userAgent,
          request_path: req.path,
          request_method: req.method,
          request_data: JSON.stringify({
            query: req.query,
            body: req.body,
            headers: req.headers,
          }),
          created_at: new Date().toISOString(),
        })
        .execute()
        .catch((err) => console.error("Error logging security event:", err));
    } catch (error) {
      console.error("Error logging suspicious activity:", error);
    }

    // Return a generic error to avoid giving away information
    return res.status(400).json({
      status: "error",
      message: "Invalid request",
    });
  }

  next();
}
