import express from "express";
import { db } from "./db/database";
import { sql } from "kysely";

const app = express();

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
