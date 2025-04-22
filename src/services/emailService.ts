import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { emailConfig, emailFrom, emailFromName } from "../config/environment";

// Create a transporter with Zoho SMTP configuration
const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure, // true for 465, false for other ports
  auth: {
    user: emailConfig.auth.user,
    pass: emailConfig.auth.pass,
  },
  debug: true, // Show debug output
  logger: true, // Log information about the mail
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to take our messages");
  }
});

/**
 * Compiles an email template with provided data
 *
 * @param templateName - Name of the template file (without extension)
 * @param data - Data to inject into the template
 * @returns Compiled HTML string
 */
export function compileTemplate(templateName: string, data: any): string {
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    `${templateName}.html`
  );
  const templateSource = fs.readFileSync(templatePath, "utf-8");
  const template = handlebars.compile(templateSource);
  return template(data);
}

/**
 * Organization branding interface
 */
export interface OrganizationBranding {
  name?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  emailFromName?: string;
}

/**
 * Sends an email using the configured transporter
 *
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - HTML content of the email
 * @param customFromName - Optional custom from name
 * @returns Promise resolving to the send result
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  customFromName?: string
): Promise<any> {
  const fromName = customFromName || emailFromName;

  const mailOptions = {
    from: `"${fromName}" <${emailFrom}>`,
    to,
    subject,
    html,
    // Add text version as fallback
    text:
      subject +
      " - Please view this email in a modern email client to see the content.",
  };

  console.log("Attempting to send email to:", to);
  console.log("Using SMTP configuration:", {
    host: emailConfig.host,
    port: emailConfig.port,
    user: emailConfig.auth.user,
    // Don't log the password
  });

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error: any) {
    console.error("Error sending email:", error);

    // Log more detailed error information
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "EAUTH") {
        console.error(
          "Authentication error. Please check your email credentials."
        );
      } else if (error.code === "ESOCKET") {
        console.error(
          "Socket error. Please check your SMTP host and port settings."
        );
      } else if (error.code === "ETIMEDOUT") {
        console.error(
          "Connection timed out. The SMTP server might be down or blocking your requests."
        );
      }
    }

    throw error;
  }
}

/**
 * Sends a verification email to a newly registered user
 *
 * @param to - Recipient email address
 * @param name - User's name
 * @param verificationToken - Verification token
 * @param verificationCode - Verification code (optional)
 * @returns Promise resolving to the send result
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationToken: string,
  verificationCode?: string,
  branding?: OrganizationBranding
): Promise<any> {
  // Import appUrl directly to ensure we get the correct value
  const { appUrl, apiUrl } = require("../config/environment");

  console.log("Using frontend URL for verification:", appUrl);
  console.log("Backend API URL:", apiUrl);

  // Ensure the token is properly encoded for URLs
  const encodedToken = encodeURIComponent(verificationToken);
  const verificationUrl = `${appUrl}/auth/verify-email?token=${encodedToken}`;

  console.log("Creating verification email with URL:", verificationUrl);

  // Default colors
  const primaryColor = branding?.primaryColor || "#10b981"; // Default emerald
  const secondaryColor = branding?.secondaryColor || "#18181b"; // Default dark zinc

  // Compile the email template with user data and branding
  const html = compileTemplate("emailVerification", {
    name,
    verificationUrl,
    verificationCode:
      verificationCode || verificationToken.substring(0, 6).toUpperCase(),
    year: new Date().getFullYear(),
    privacyUrl: `${appUrl}/privacy`,
    termsUrl: `${appUrl}/terms`,
    // Add branding
    logoUrl: branding?.logoUrl || "",
    primaryColor,
    secondaryColor,
    organizationName: branding?.name || "MinSlack",
  });

  // Send the email with optional custom from name
  return sendEmail(
    to,
    "Verify Your Email Address",
    html,
    branding?.emailFromName
  );
}

/**
 * Sends an invitation email
 *
 * @param to - Recipient email address
 * @param inviterName - Name of the person sending the invitation
 * @param workspaceName - Name of the workspace
 * @param token - Invitation token
 * @param message - Optional personal message
 * @param branding - Optional organization branding
 * @returns Promise resolving to the send result
 */
export async function sendInvitationEmail(
  to: string,
  inviterName: string,
  workspaceName: string,
  token: string,
  message?: string,
  branding?: OrganizationBranding
): Promise<any> {
  // Import appUrl directly to ensure we get the correct value
  const { appUrl, apiUrl } = require("../config/environment");

  console.log("Using frontend URL for invitation:", appUrl);
  console.log("Backend API URL:", apiUrl);

  // Ensure the token is properly encoded for URLs
  const encodedToken = encodeURIComponent(token);

  // Use the shorter invite URL format
  const invitationUrl = `${appUrl}/invite/${encodedToken}`;

  console.log("Creating invitation email with URL:", invitationUrl);

  // Default colors
  const primaryColor = branding?.primaryColor || "#10b981"; // Default emerald
  const secondaryColor = branding?.secondaryColor || "#18181b"; // Default dark zinc
  const organizationName = branding?.name || "MinSlack";

  // Compile the email template with invitation data and branding
  const html = compileTemplate("invitation", {
    inviterName,
    workspaceName,
    invitationUrl,
    message,
    year: new Date().getFullYear(),
    privacyUrl: `${appUrl}/privacy`,
    termsUrl: `${appUrl}/terms`,
    // Add branding
    logoUrl: branding?.logoUrl || "",
    primaryColor,
    secondaryColor,
    organizationName,
  });

  // Send the email with optional custom from name
  return sendEmail(
    to,
    `${inviterName} invited you to join ${workspaceName} on ${organizationName}`,
    html,
    branding?.emailFromName
  );
}
