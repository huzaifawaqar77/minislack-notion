import express from "express";
import { db } from "./db/database";
import { sql } from "kysely";
import cors from "cors";

import AuthRoutes from "./routes/authRoutes";
import SessionRoutes from "./routes/sessionRoutes";
import VerificationRoutes from "./routes/verificationRoutes";
import { port } from "./config/environment";

const app = express();

// middlewares

// 1. Enable CORS for all routes
app.use(cors());

// 2. middleware for reading request body
app.use(express.json());

// Add request IP and user agent middleware
app.use((req, _res, next) => {
  // Log request details for debugging
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`
  );
  next();
});

// Routes

// 1. Auth Routes
app.use("/auth", AuthRoutes);

// 2. Session Routes
app.use("/sessions", SessionRoutes);

// 3. Verification Routes
app.use("/auth", VerificationRoutes);

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

app.listen(port, () => {
  console.log("🖥  Application started on port 3000");
});

// Test the connection when the application starts
testConnection();
