import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { log } from "./vite";

neonConfig.webSocketConstructor = ws;

// Check for required environment variables
if (!process.env.DATABASE_URL) {
  log("Environment Error: DATABASE_URL is not set");
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// For security, log only that we have the connection URL, not the URL itself
log("Database connection URL is set");

// Create connection pool with specific SSL and connection settings
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 5000, // 5 second timeout
  max: 20 // Maximum number of clients in the pool
});

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