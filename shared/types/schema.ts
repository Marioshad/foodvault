import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Database tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'home', 'office', etc.
  userId: integer("user_id").notNull(),
});

export const foodItems = pgTable("food_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(), // g, kg, pieces, etc.
  locationId: integer("location_id").notNull(),
  expiryDate: date("expiry_date").notNull(),
  price: integer("price"), // in cents
  purchased: timestamp("purchased").notNull(),
  userId: integer("user_id").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLocationSchema = createInsertSchema(locations).pick({
  name: true,
  type: true,
});

export const insertFoodItemSchema = createInsertSchema(foodItems)
  .pick({
    name: true,
    quantity: true,
    unit: true,
    locationId: true,
    expiryDate: true,
    price: true,
  })
  .extend({
    expiryDate: z.coerce.date(),
    price: z.number().min(0).optional(),
  });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;

export type User = typeof users.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type FoodItem = typeof foodItems.$inferSelect;
