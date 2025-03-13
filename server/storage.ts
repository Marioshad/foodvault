import {
  type User,
  type Location,
  type FoodItem,
  type InsertUser,
  type InsertLocation,
  type InsertFoodItem,
  users,
  locations,
  foodItems,
} from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Location operations
  getLocations(userId: number): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation & { userId: number }): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location>;
  deleteLocation(id: number): Promise<void>;

  // Food item operations
  getFoodItems(userId: number): Promise<FoodItem[]>;
  getFoodItem(id: number): Promise<FoodItem | undefined>;
  createFoodItem(item: InsertFoodItem & { userId: number }): Promise<FoodItem>;
  updateFoodItem(id: number, item: Partial<InsertFoodItem>): Promise<FoodItem>;
  deleteFoodItem(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Location operations
  async getLocations(userId: number): Promise<Location[]> {
    return await db
      .select()
      .from(locations)
      .where(eq(locations.userId, userId));
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db
      .select()
      .from(locations)
      .where(eq(locations.id, id));
    return location;
  }

  async createLocation(
    location: InsertLocation & { userId: number },
  ): Promise<Location> {
    const [newLocation] = await db
      .insert(locations)
      .values(location)
      .returning();
    return newLocation;
  }

  async updateLocation(
    id: number,
    location: Partial<InsertLocation>,
  ): Promise<Location> {
    const [updatedLocation] = await db
      .update(locations)
      .set(location)
      .where(eq(locations.id, id))
      .returning();
    return updatedLocation;
  }

  async deleteLocation(id: number): Promise<void> {
    await db.delete(locations).where(eq(locations.id, id));
  }

  // Food item operations
  async getFoodItems(userId: number): Promise<FoodItem[]> {
    return await db
      .select()
      .from(foodItems)
      .where(eq(foodItems.userId, userId));
  }

  async getFoodItem(id: number): Promise<FoodItem | undefined> {
    const [item] = await db
      .select()
      .from(foodItems)
      .where(eq(foodItems.id, id));
    return item;
  }

  async createFoodItem(
    item: InsertFoodItem & { userId: number },
  ): Promise<FoodItem> {
    const [newItem] = await db
      .insert(foodItems)
      .values({
        ...item,
        purchased: new Date().toISOString(),
        expiryDate: item.expiryDate.toISOString(),
      })
      .returning();
    return newItem;
  }

  async updateFoodItem(
    id: number,
    item: Partial<InsertFoodItem>,
  ): Promise<FoodItem> {
    const [updatedItem] = await db
      .update(foodItems)
      .set({
        ...item,
        expiryDate: item.expiryDate?.toISOString(),
      })
      .where(eq(foodItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteFoodItem(id: number): Promise<void> {
    await db.delete(foodItems).where(eq(foodItems.id, id));
  }
}

export const storage = new DatabaseStorage();