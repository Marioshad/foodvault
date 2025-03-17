import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../../../shared/types/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let retries = 5;
const retryInterval = 5000; // 5 seconds

async function createPool() {
  while (retries) {
    try {
      console.log("Attempting to connect to database...");
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });

      // Test the connection
      await pool.query('SELECT NOW()');
      console.log("Successfully connected to database");

      return pool;
    } catch (error) {
      retries--;
      if (retries === 0) {
        console.error("Failed to connect to database after all retries:", error);
        throw error;
      }
      console.log(`Failed to connect to database. Retrying in ${retryInterval/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
  }
}

async function initializeDatabase() {
  const pool = await createPool();
  if (!pool) {
    throw new Error("Failed to create database pool after all retries");
  }
  return { pool, db: drizzle(pool, { schema }) };
}

export async function getDatabaseConnection() {
  const { pool, db } = await initializeDatabase();
  return { pool, db };
}
