import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { appUrl } from "../config/environment";

/**
 * Handles Google OAuth authentication
 */
export function googleAuthController(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
}

/**
 * Handles Google OAuth callback
 */
export function googleCallbackController(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("google", { session: false }, (err, data) => {
    if (err) {
      console.error("Google OAuth error:", err);
      return res.redirect(`${appUrl}/auth/oauth-error?provider=google`);
    }
    
    if (!data || !data.token) {
      console.error("Google OAuth failed: No data or token");
      return res.redirect(`${appUrl}/auth/oauth-error?provider=google`);
    }
    
    // Redirect to frontend with token
    return res.redirect(`${appUrl}/auth/oauth-success?token=${data.token}`);
  })(req, res, next);
}

/**
 * Handles GitHub OAuth authentication
 */
export function githubAuthController(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
}

/**
 * Handles GitHub OAuth callback
 */
export function githubCallbackController(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("github", { session: false }, (err, data) => {
    if (err) {
      console.error("GitHub OAuth error:", err);
      return res.redirect(`${appUrl}/auth/oauth-error?provider=github`);
    }
    
    if (!data || !data.token) {
      console.error("GitHub OAuth failed: No data or token");
      return res.redirect(`${appUrl}/auth/oauth-error?provider=github`);
    }
    
    // Redirect to frontend with token
    return res.redirect(`${appUrl}/auth/oauth-success?token=${data.token}`);
  })(req, res, next);
}
