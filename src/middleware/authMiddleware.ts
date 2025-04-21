import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { jwtSecret } from "../config/environment";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; username: string };
}

export function verifyToken(token: string) {
  return jwt.verify(token, jwtSecret) as {
    id: string;
    username: string;
    email: string;
  };
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req?.headers?.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ status: "error", message: "No authorization header provided" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res
      .status(401)
      .json({ status: "error", message: "Invalid authorization format" });
  }

  const token = parts[1];
  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      username: string;
      email: string;
    };
    req.user = decoded;
    next(); // Call next to continue to the next middleware/route handler
  } catch (error) {
    return res
      .status(401)
      .json({ status: "error", message: "Invalid or expired token" });
  }
}
