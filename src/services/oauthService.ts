import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { googleOAuth, githubOAuth } from "../config/environment";
import { db } from "../db/database";
import crypto from "crypto";
import { generateToken } from "../middleware/authMiddleware";

/**
 * Initialize OAuth strategies
 */
export function initializeOAuth() {
  // Configure Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleOAuth.clientID,
        clientSecret: googleOAuth.clientSecret,
        callbackURL: googleOAuth.callbackURL,
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract user information from Google profile
          const email = profile.emails?.[0]?.value;
          
          if (!email) {
            return done(new Error("Email not provided by Google"), null);
          }
          
          // Check if user already exists
          const existingUser = await db
            .selectFrom("users")
            .selectAll()
            .where("email", "=", email)
            .executeTakeFirst();
          
          if (existingUser) {
            // Update OAuth information if needed
            if (!existingUser.google_id) {
              await db
                .updateTable("users")
                .set({
                  google_id: profile.id,
                  updated_at: new Date().toISOString(),
                })
                .where("id", "=", existingUser.id)
                .execute();
            }
            
            // Generate JWT token
            const token = generateToken(existingUser);
            
            return done(null, { user: existingUser, token });
          }
          
          // Create new user
          const newUser = await db
            .insertInto("users")
            .values({
              id: crypto.randomUUID(),
              email,
              username: profile.displayName || email.split("@")[0],
              first_name: profile.name?.givenName || "",
              last_name: profile.name?.familyName || "",
              google_id: profile.id,
              avatar_url: profile.photos?.[0]?.value || null,
              email_verified: true, // Google already verified the email
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .returningAll()
            .executeTakeFirstOrThrow();
          
          // Generate JWT token
          const token = generateToken(newUser);
          
          return done(null, { user: newUser, token });
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
  
  // Configure GitHub Strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: githubOAuth.clientID,
        clientSecret: githubOAuth.clientSecret,
        callbackURL: githubOAuth.callbackURL,
        scope: ["user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract user information from GitHub profile
          const emails = profile.emails || [];
          const primaryEmail = emails.find(email => email.primary)?.value || emails[0]?.value;
          
          if (!primaryEmail) {
            return done(new Error("Email not provided by GitHub"), null);
          }
          
          // Check if user already exists
          const existingUser = await db
            .selectFrom("users")
            .selectAll()
            .where("email", "=", primaryEmail)
            .executeTakeFirst();
          
          if (existingUser) {
            // Update OAuth information if needed
            if (!existingUser.github_id) {
              await db
                .updateTable("users")
                .set({
                  github_id: profile.id,
                  updated_at: new Date().toISOString(),
                })
                .where("id", "=", existingUser.id)
                .execute();
            }
            
            // Generate JWT token
            const token = generateToken(existingUser);
            
            return done(null, { user: existingUser, token });
          }
          
          // Parse name from GitHub profile
          let firstName = "";
          let lastName = "";
          
          if (profile.displayName) {
            const nameParts = profile.displayName.split(" ");
            firstName = nameParts[0] || "";
            lastName = nameParts.slice(1).join(" ") || "";
          }
          
          // Create new user
          const newUser = await db
            .insertInto("users")
            .values({
              id: crypto.randomUUID(),
              email: primaryEmail,
              username: profile.username || primaryEmail.split("@")[0],
              first_name: firstName,
              last_name: lastName,
              github_id: profile.id,
              avatar_url: profile.photos?.[0]?.value || null,
              email_verified: true, // GitHub already verified the email
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .returningAll()
            .executeTakeFirstOrThrow();
          
          // Generate JWT token
          const token = generateToken(newUser);
          
          return done(null, { user: newUser, token });
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
  
  // Serialize user to session
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });
  
  // Deserialize user from session
  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });
  
  return passport;
}
