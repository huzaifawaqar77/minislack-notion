import dotenv from "dotenv";
dotenv.config({
  path: "./src/config/config.env",
});

import nodemailer from "nodemailer";
import { emailConfig, emailFrom, emailFromName } from "./config/environment";
console.log("hello")

async function testEmailConnection() {
  console.log("Testing email connection with the following configuration:");
  console.log("Host:", emailConfig.host);
  console.log("Port:", emailConfig.port);
  console.log("User:", emailConfig.auth.user);
  console.log("From:", emailFrom);

  // Create a test account if needed (for testing with Ethereal)
  // const testAccount = await nodemailer.createTestAccount();

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
  try {
    const verification = await transporter.verify();
    console.log("SMTP connection verified:", verification);

    // Send a test email
    const info = await transporter.sendMail({
      from: `"${emailFromName}" <${emailFrom}>`,
      to: emailConfig.auth.user, // Send to yourself for testing
      subject: "Test Email from MinSlack",
      text: "This is a test email to verify SMTP configuration.",
      html: "<b>This is a test email to verify SMTP configuration.</b>",
    });

    console.log("Test email sent successfully!");
    console.log("Message ID:", info.messageId);

    return true;
  } catch (error: any) {
    // Type assertion for error
    console.error("SMTP connection error:", error);

    // Provide more specific error information
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "EAUTH") {
        console.error(
          "Authentication failed. Please check your email credentials."
        );
        console.error(
          "Make sure you're using the correct password or app-specific password."
        );
        console.error(
          "For Zoho, you might need to generate an app password in your Zoho account settings."
        );
      } else if (error.code === "ESOCKET") {
        console.error(
          "Socket error. Please check your SMTP host and port settings."
        );
        console.error(
          "For Zoho, try using smtp.zoho.com or smtp.zoho.eu depending on your region."
        );
      }
    }

    return false;
  }
}

// Run the test
testEmailConnection()
  .then((success) => {
    if (success) {
      console.log("Email test completed successfully!");
    } else {
      console.log("Email test failed. Please check the error messages above.");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });
