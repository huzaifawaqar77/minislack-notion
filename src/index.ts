import express from "express";
import { createServer } from "http";
import { db } from "./db/database";
import { sql } from "kysely";
import cors from "cors";
import path from "path";
import session from "express-session";
import passport from "passport";

import AuthRoutes from "./routes/authRoutes";
import SessionRoutes from "./routes/sessionRoutes";
import VerificationRoutes from "./routes/verificationRoutes";
import OrganizationRoutes from "./routes/organizationRoutes";
import WorkspaceRoutes from "./routes/workspaceRoutes";
import ChannelRoutes from "./routes/channelRoutes";
import MessageRoutes from "./routes/messageRoutes";
import FileRoutes from "./routes/fileRoutes";
import SearchRoutes from "./routes/searchRoutes";
import NotificationRoutes from "./routes/notificationRoutes";
import InvitationRoutes from "./routes/invitationRoutes";
import WebhookRoutes from "./routes/webhookRoutes";
import AnalyticsRoutes from "./routes/analyticsRoutes";
import OAuthRoutes from "./routes/oauthRoutes";
import SecurityRoutes from "./routes/securityRoutes";
import UserRoutes from "./routes/userRoutes";
import DMRoutes from "./routes/dmRoutes";
import DashboardRoutes from "./routes/dashboardRoutes";
import ProjectRoutes from "./routes/projectRoutes";
import { port, sessionSecret } from "./config/environment";
import { detectDomain } from "./middleware/domainMiddleware";
import { initializeSocketIO } from "./services/socketService";
import { initializeOAuth } from "./services/oauthService";
import {
  securityHeaders,
  securityEventLogger,
  suspiciousActivityDetection,
} from "./middleware/securityMiddleware";
import { apiRateLimit, authRateLimit } from "./services/securityService";

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocketIO(httpServer);

// Export the Socket.IO instance
export function getIO() {
  return io;
}

// Initialize OAuth
const passportInstance = initializeOAuth();

// Make io available in the request object
declare global {
  namespace Express {
    interface Request {
      io?: any;
    }
  }
}

// middlewares

// 1. Enable CORS for all routes with specific configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Allow the frontend origin
    credentials: true, // Allow credentials (cookies, authorization headers)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"], // Allowed headers
  })
);

// 2. middleware for reading request body with increased limit
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// 3. Domain detection middleware
app.use(detectDomain);

// 4. Make io available in the request object
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// 5. Security headers middleware
app.use(securityHeaders);

// 6. Suspicious activity detection
app.use(suspiciousActivityDetection);

// 7. Security event logger
app.use(securityEventLogger);

// 8. API rate limiting
app.use("/api/", apiRateLimit);

// 9. Stricter rate limiting for auth routes
app.use("/auth/", authRateLimit);

// 10. Request logging middleware
app.use((req, _res, next) => {
  // Log request details for debugging
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`
  );
  next();
});

// 11. Session middleware
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// 12. Initialize Passport
app.use(passportInstance.initialize());

// 13. Serve static files from uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 14. Serve static files from public directory
app.use(express.static(path.join(process.cwd(), "public")));

// Routes

// 1. Auth Routes
app.use("/auth", AuthRoutes);

// 2. Session Routes
app.use("/sessions", SessionRoutes);

// 3. Verification Routes
app.use("/auth", VerificationRoutes);

// 4. Organization Routes
app.use("/organizations", OrganizationRoutes);

// 5. Workspace Routes
app.use("/workspaces", WorkspaceRoutes);

// 6. Channel Routes
app.use("/", ChannelRoutes);

// 7. Message Routes
app.use("/", MessageRoutes);

// 8. File Routes
app.use("/", FileRoutes);

// 9. Search Routes
app.use("/", SearchRoutes);

// 10. Notification Routes
app.use("/", NotificationRoutes);

// 11. Invitation Routes
app.use("/", InvitationRoutes);

// 12. Webhook Routes
app.use("/", WebhookRoutes);

// 13. Analytics Routes
app.use("/", AnalyticsRoutes);

// 14. OAuth Routes
app.use("/auth", OAuthRoutes);

// 15. Security Routes
app.use("/security", SecurityRoutes);

// 16. User Routes
app.use("/users", UserRoutes);

// 17. DM Routes
app.use("/", DMRoutes);

// 18. Dashboard Routes
app.use("/", DashboardRoutes);

// 19. Project Routes
app.use("/projects", ProjectRoutes);

async function testConnection() {
  try {
    // Execute a simple query to test the connection
    await db.executeQuery(sql`SELECT 1`.compile(db));
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

// Test the connection when the application starts
testConnection();

// Start the HTTP server (which also starts the WebSocket server)
httpServer.listen(port, () => {
  console.log(`🖥  Application started on port ${port}`);
  console.log(`🔌 WebSocket server initialized`);
});
