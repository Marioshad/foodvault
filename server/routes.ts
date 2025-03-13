import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertLocationSchema, insertFoodItemSchema } from "@shared/schema";
import multer from "multer";
import { processReceipt } from "./receipt-processor";

function ensureAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) return next();
  res.sendStatus(401);
}

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Receipt upload route
  app.post(
    "/api/receipts/upload",
    ensureAuthenticated,
    upload.single("receipt"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        const result = await processReceipt(req.file.buffer);
        res.json(result);
      } catch (error: any) {
        console.error('Receipt processing error:', error);
        res.status(500).json({ message: error.message });
      }
    },
  );

  // Location routes
  app.get("/api/locations", ensureAuthenticated, async (req, res) => {
    const locations = await storage.getLocations(req.user!.id);
    res.json(locations);
  });

  app.post("/api/locations", ensureAuthenticated, async (req, res) => {
    const data = insertLocationSchema.parse(req.body);
    const location = await storage.createLocation({
      ...data,
      userId: req.user!.id,
    });
    res.status(201).json(location);
  });

  app.patch("/api/locations/:id", ensureAuthenticated, async (req, res) => {
    const data = insertLocationSchema.partial().parse(req.body);
    const location = await storage.updateLocation(parseInt(req.params.id), data);
    res.json(location);
  });

  app.delete("/api/locations/:id", ensureAuthenticated, async (req, res) => {
    await storage.deleteLocation(parseInt(req.params.id));
    res.sendStatus(204);
  });

  // Food item routes
  app.get("/api/food-items", ensureAuthenticated, async (req, res) => {
    const items = await storage.getFoodItems(req.user!.id);
    res.json(items);
  });

  app.post("/api/food-items", ensureAuthenticated, async (req, res) => {
    const data = insertFoodItemSchema.parse(req.body);
    const item = await storage.createFoodItem({
      ...data,
      userId: req.user!.id,
    });
    res.status(201).json(item);
  });

  app.patch("/api/food-items/:id", ensureAuthenticated, async (req, res) => {
    const data = insertFoodItemSchema.partial().parse(req.body);
    const item = await storage.updateFoodItem(parseInt(req.params.id), data);
    res.json(item);
  });

  app.delete("/api/food-items/:id", ensureAuthenticated, async (req, res) => {
    await storage.deleteFoodItem(parseInt(req.params.id));
    res.sendStatus(204);
  });

  const httpServer = createServer(app);
  return httpServer;
}