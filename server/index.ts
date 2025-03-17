import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { getDatabaseConnection } from "./db";
import { users } from "@shared/schema";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure CORS for development
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",  // Development
  /\.replit\.app$/  // Production domains on Replit
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Add detailed request logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log("Starting server...");
    console.log("Node environment:", process.env.NODE_ENV);

    // Log available environment variables (excluding sensitive data)
    const safeEnvVars = Object.keys(process.env).filter(key => 
      !key.toLowerCase().includes('key') && 
      !key.toLowerCase().includes('secret') && 
      !key.toLowerCase().includes('password') &&
      !key.toLowerCase().includes('token')
    );
    console.log("Available environment variables:", safeEnvVars.join(", "));

    // Verify critical environment variables
    const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET', 'OPENAI_API_KEY'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }

    // Initialize database connection with retries
    console.log("Initializing database connection...");
    const { db } = await getDatabaseConnection();

    // Test database connection
    try {
      await db.select().from(users).limit(1);
      log("Database connection successful");
    } catch (dbError) {
      log("Database connection failed:", dbError);
      throw dbError;
    }

    const server = await registerRoutes(app);

    // Enhanced error handling
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;

      // Enhanced error logging
      log(`Error [${status}]: ${message}`);
      if (stack) {
        log(`Stack trace: ${stack}`);
      }

      res.status(status).json({ 
        message,
        ...(stack ? { stack } : {})
      });
    });

    // In production, we don't need to serve static files since frontend is separate
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    }

    const port = process.env.PORT || 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`Server listening on port ${port}`);
    });
  } catch (error: any) {
    log(`Failed to start server: ${error.message}`);
    if (error.stack) {
      log(`Stack trace: ${error.stack}`);
    }
    process.exit(1);
  }
})();