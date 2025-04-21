import { Request, Response } from "express";
import { loginUser, registerUser } from "../repositories/userRepository";
import { parseUserAgent, getClientIp } from "../utils/deviceInfo";

export function loginController(req: Request, res: Response) {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    return res.status(401).send("Username or password is required");
  }

  try {
    // Get device information from user agent
    const userAgent = req.headers["user-agent"] || "";
    const deviceInfo = parseUserAgent(userAgent);

    // Get client IP address
    const ipAddress = getClientIp(req);

    // Login with device info and IP address
    const loginResult = loginUser(
      usernameOrEmail,
      password,
      deviceInfo,
      ipAddress
    );
    if (!loginResult) {
      return res.status(401).send("Username or password is required");
    }

    res.status(200).json({
      status: "success",
      user: loginResult,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({
      status: "error",
      message: error instanceof Error ? error.message : "Authentication failed",
    });
  }
}

export const registerController = async (req: Request, res: Response) => {
  const { email, username, password, firstName, lastName } = req.body;

  console.log(req.body, "request ");
  if (!username || !password || !email || !firstName || !lastName) {
    return res.status(401).json({
      status: "error",
      message: "You must fill all fields in order to register",
    });
  }

  try {
    const registerResult = await registerUser(
      email,
      username,
      password,
      firstName,
      lastName
    );

    return res.status(200).json({
      status: "success",
      user: registerResult,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(400).json({
      status: "error",
      message: error instanceof Error ? error.message : "Registration failed",
    });
  }
};
