import dotenv from "dotenv";
dotenv.config({
  path: "./src/config/config.env",
});

// Server and Database
export const port = process.env.PORT;
export const url = process.env.DB_URL;
export const host = process.env.DB_HOST;
export const db_port = process.env.DB_PORT;
export const db_password = process.env.DB_PASSWORD;
export const jwtSecret = process.env.JWT_SECRET || "myverysecretjwt";

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
export const appUrl = process.env.APP_URL || "http://localhost:3000";
