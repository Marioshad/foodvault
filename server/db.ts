import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { log } from "./vite";

neonConfig.webSocketConstructor = ws;

// Enhanced environment variable check
if (!process.env.DATABASE_URL) {
  log("Environment variables status:");
  log(`DATABASE_URL: ${process.env.DATABASE_URL ? "Set" : "Not set"}`);
  log(`PGHOST: ${process.env.PGHOST ? "Set" : "Not set"}`);
  log(`PGPORT: ${process.env.PGPORT ? "Set" : "Not set"}`);
  log(`PGUSER: ${process.env.PGUSER ? "Set" : "Not set"}`);
  log(`PGDATABASE: ${process.env.PGDATABASE ? "Set" : "Not set"}`);

  // Try to construct DATABASE_URL from individual components if available
  if (process.env.PGHOST && process.env.PGPORT && process.env.PGUSER && 
      process.env.PGPASSWORD && process.env.PGDATABASE) {
    process.env.DATABASE_URL = `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
    log("Constructed DATABASE_URL from individual components");
  } else {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Test the database connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    log("Database connection test successful");
    client.release();
    return true;
  } catch (error: any) {
    log(`Database connection test failed: ${error.message}`);
    if (error.stack) {
      log(`Stack trace: ${error.stack}`);
    }
    throw error;
  }
}

export const db = drizzle(pool, { schema });