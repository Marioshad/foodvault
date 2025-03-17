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
} from "../../../shared/types/schema";
import session from "express-session";
import { getDatabaseConnection } from "../config/database";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";

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
  private dbPromise: Promise<{ db: any, pool: any }>;

  constructor() {
    this.dbPromise = getDatabaseConnection();
    this.sessionStore = new PostgresSessionStore({
      pool: this.dbPromise.then(({ pool }) => pool),
      createTableIfMissing: true,
    });
  }

  private async getDb() {
    const { db } = await this.dbPromise;
    return db;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const db = await this.getDb();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = await this.getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const db = await this.getDb();
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Location operations
  async getLocations(userId: number): Promise<Location[]> {
    const db = await this.getDb();
    return await db
      .select()
      .from(locations)
      .where(eq(locations.userId, userId));
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const db = await this.getDb();
    const [location] = await db
      .select()
      .from(locations)
      .where(eq(locations.id, id));
    return location;
  }

  async createLocation(
    location: InsertLocation & { userId: number },
  ): Promise<Location> {
    const db = await this.getDb();
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
    const db = await this.getDb();
    const [updatedLocation] = await db
      .update(locations)
      .set(location)
      .where(eq(locations.id, id))
      .returning();
    return updatedLocation;
  }

  async deleteLocation(id: number): Promise<void> {
    const db = await this.getDb();
    await db.delete(locations).where(eq(locations.id, id));
  }

  // Food item operations
  async getFoodItems(userId: number): Promise<FoodItem[]> {
    const db = await this.getDb();
    return await db
      .select()
      .from(foodItems)
      .where(eq(foodItems.userId, userId));
  }

  async getFoodItem(id: number): Promise<FoodItem | undefined> {
    const db = await this.getDb();
    const [item] = await db
      .select()
      .from(foodItems)
      .where(eq(foodItems.id, id));
    return item;
  }

  async createFoodItem(
    item: InsertFoodItem & { userId: number },
  ): Promise<FoodItem> {
    const db = await this.getDb();
    const purchased = new Date();
    const [newItem] = await db
      .insert(foodItems)
      .values({
        ...item,
        purchased,
        expiryDate: item.expiryDate,
      })
      .returning();
    return newItem;
  }

  async updateFoodItem(
    id: number,
    item: Partial<InsertFoodItem>,
  ): Promise<FoodItem> {
    const db = await this.getDb();
    const [updatedItem] = await db
      .update(foodItems)
      .set({
        ...item,
        expiryDate: item.expiryDate,
      })
      .where(eq(foodItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteFoodItem(id: number): Promise<void> {
    const db = await this.getDb();
    await db.delete(foodItems).where(eq(foodItems.id, id));
  }
}

export const storage = new DatabaseStorage();
