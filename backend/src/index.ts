import express, { type Request, Response, NextFunction } from "express";
import { getDatabaseConnection } from "./config/database";
import { users } from "../../shared/types/schema";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { storage } from "./storage";
import { setupRoutes } from "./routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure CORS for frontend access
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
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  try {
    console.log("Starting server...");
    console.log("Node environment:", process.env.NODE_ENV);

    // Verify critical environment variables
    const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET', 'OPENAI_API_KEY'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }

    // Initialize database connection
    console.log("Initializing database connection...");
    const { db } = await getDatabaseConnection();

    // Test database connection
    try {
      await db.select().from(users).limit(1);
      console.log("Database connection successful");
    } catch (dbError) {
      console.error("Database connection failed:", dbError);
      throw dbError;
    }

    // Session configuration
    app.use(session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      store: storage.sessionStore,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }));

    // Initialize passport
    app.use(passport.initialize());
    app.use(passport.session());

    // Setup routes
    setupRoutes(app);

    // Enhanced error handling
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;

      console.error(`Error [${status}]: ${message}`);
      if (stack) {
        console.error(`Stack trace: ${stack}`);
      }

      res.status(status).json({ 
        message,
        ...(stack ? { stack } : {})
      });
    });

    const port = process.env.PORT || 5000;
    app.listen({
      port,
      host: "0.0.0.0",
    }, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error: any) {
    console.error(`Failed to start server: ${error.message}`);
    if (error.stack) {
      console.error(`Stack trace: ${error.stack}`);
    }
    process.exit(1);
  }
})();