import dotenv from "dotenv";
dotenv.config({
  path: "./src/config/config.env",
});

// Base URL - This should be the frontend URL for email links
export const appUrl = process.env.FRONTEND_URL || "http://localhost:3000";

// API URL - This is the backend URL
export const apiUrl = process.env.APP_URL || "http://localhost:3001";

// Server and Database
export const port = process.env.PORT;
export const url = process.env.DB_URL;
export const host = process.env.DB_HOST;
export const db_port = process.env.DB_PORT;
export const db_password = process.env.DB_PASSWORD;
export const jwtSecret = process.env.JWT_SECRET || "myverysecretjwt";

// Session Configuration
export const sessionSecret = process.env.SESSION_SECRET || "mysessionsecret";

// OAuth Configuration
export const googleOAuth = {
  clientID: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  callbackURL:
    process.env.GOOGLE_CALLBACK_URL || `${apiUrl}/auth/google/callback`,
};

export const githubOAuth = {
  clientID: process.env.GITHUB_CLIENT_ID || "",
  clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  callbackURL:
    process.env.GITHUB_CALLBACK_URL || `${apiUrl}/auth/github/callback`,
};

// Email Configuration
export const emailConfig = {
  host: process.env.EMAIL_HOST || "smtp.zoho.com",
  port: parseInt(process.env.EMAIL_PORT || "465"),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASSWORD || "",
  },
};

export const emailFrom = process.env.EMAIL_FROM || "huzaifa@uiflexer.com";
export const emailFromName = process.env.EMAIL_FROM_NAME || "MinSlack";
