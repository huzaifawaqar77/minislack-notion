import express from "express";
import { db } from "./db/database";
import { sql } from "kysely";

import AuthRoutes from "./routes/authRoutes"
import {port} from "./config/environment";

const app = express();

// middlewares

// 1. middleware for reading request body
app.use(express.json());


// Routes

// 1. Auth Routes
app.use("/auth", AuthRoutes )



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
  console.log("✅ Application started on port 3000");
})

// Test the connection when the application starts
testConnection();
