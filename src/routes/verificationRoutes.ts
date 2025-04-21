import express, { Router, Request, Response } from "express";
import { verifyToken, markEmailAsVerified, generateVerificationToken } from "../repositories/verificationRepository";
import { sendVerificationEmail } from "../services/emailService";
import { db } from "../db/database";

const router: Router = express.Router();

// Verify email with token
router.get("/verify-email", async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        status: "error",
        message: "Invalid verification token"
      });
    }
    
    // Verify the token
    const userId = await verifyToken(token);
    
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired verification token"
      });
    }
    
    // Mark the user's email as verified
    const success = await markEmailAsVerified(userId);
    
    if (!success) {
      return res.status(500).json({
        status: "error",
        message: "Failed to verify email"
      });
    }
    
    // Get the user's information
    const user = await db
      .selectFrom("users")
      .select(["email", "username", "first_name"])
      .where("id", "=", userId)
      .executeTakeFirst();
    
    // Return success response
    return res.status(200).json({
      status: "success",
      message: "Email verified successfully",
      user: {
        email: user?.email,
        username: user?.username
      }
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to verify email"
    });
  }
});

// Resend verification email
router.post("/resend-verification", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required"
      });
    }
    
    // Find the user by email
    const user = await db
      .selectFrom("users")
      .select(["id", "email", "username", "first_name", "email_verified"])
      .where("email", "=", email)
      .executeTakeFirst();
    
    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      return res.status(200).json({
        status: "success",
        message: "If your email exists in our system, a verification email has been sent"
      });
    }
    
    // Check if the email is already verified
    if (user.email_verified) {
      return res.status(400).json({
        status: "error",
        message: "Email is already verified"
      });
    }
    
    // Generate a new verification token
    const verificationToken = await generateVerificationToken(user.id);
    
    // Send verification email
    await sendVerificationEmail(
      user.email,
      user.first_name || user.username,
      verificationToken
    );
    
    return res.status(200).json({
      status: "success",
      message: "Verification email sent successfully"
    });
  } catch (error) {
    console.error("Error resending verification email:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to resend verification email"
    });
  }
});

export default router;
