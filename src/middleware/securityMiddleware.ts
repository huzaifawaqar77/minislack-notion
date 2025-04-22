import { Request, Response, NextFunction } from "express";
import { validateCsrfToken } from "../repositories/csrfRepository";
import { detectSuspiciousActivity } from "../services/securityService";
import { db } from "../db/database";
import crypto from "crypto";

/**
 * Middleware to validate CSRF tokens
 */
export async function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF validation for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Skip CSRF validation for API endpoints that use JWT authentication
  if (req.path.startsWith('/api/') && req.headers.authorization) {
    return next();
  }
  
  // Get the CSRF token from the request
  const token = req.body._csrf || req.headers['x-csrf-token'] || req.headers['csrf-token'];
  
  if (!token) {
    return res.status(403).json({
      status: 'error',
      message: 'CSRF token missing'
    });
  }
  
  // Get the user ID from the session or JWT
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(403).json({
      status: 'error',
      message: 'Authentication required'
    });
  }
  
  // Validate the token
  const isValid = await validateCsrfToken(token as string, userId);
  
  if (!isValid) {
    return res.status(403).json({
      status: 'error',
      message: 'Invalid or expired CSRF token'
    });
  }
  
  next();
}

/**
 * Middleware to detect and block suspicious activity
 */
export function suspiciousActivityDetection(req: Request, res: Response, next: NextFunction) {
  detectSuspiciousActivity(req, res, next);
}

/**
 * Middleware to log security events
 */
export function securityEventLogger(req: Request, res: Response, next: NextFunction) {
  // Capture the original end method
  const originalEnd = res.end;
  
  // Override the end method
  res.end = function(chunk?: any, encoding?: any, callback?: any): any {
    // Restore the original end method
    res.end = originalEnd;
    
    // Log security-relevant events
    if (res.statusCode >= 400) {
      const userId = req.user?.id;
      const userAgent = req.headers['user-agent'] || '';
      const ipAddress = req.ip;
      
      // Create a hash of the IP address for security
      const ipHash = crypto.createHash('sha256').update(ipAddress).digest('hex');
      
      // Determine event type based on status code
      let eventType = 'error';
      if (res.statusCode === 401 || res.statusCode === 403) {
        eventType = 'auth_failure';
      } else if (res.statusCode === 429) {
        eventType = 'rate_limit';
      } else if (res.statusCode >= 500) {
        eventType = 'server_error';
      }
      
      // Log the event
      db.insertInto('security_events')
        .values({
          id: crypto.randomUUID(),
          event_type: eventType,
          ip_address: ipHash,
          user_agent: userAgent,
          user_id: userId,
          request_path: req.path,
          request_method: req.method,
          request_data: JSON.stringify({
            query: req.query,
            body: req.body ? { ...req.body, password: '[REDACTED]' } : null,
            statusCode: res.statusCode
          }),
          created_at: new Date().toISOString()
        })
        .execute()
        .catch(err => console.error('Error logging security event:', err));
    }
    
    // Call the original end method
    return originalEnd.call(this, chunk, encoding, callback);
  };
  
  next();
}

/**
 * Middleware to add security headers
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'same-origin');
  
  // Content Security Policy
  if (!res.getHeader('Content-Security-Policy')) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:;"
    );
  }
  
  next();
}
