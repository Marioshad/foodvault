import {
  type User,
  type Location,
  type FoodItem,
  type InsertUser,
  type InsertLocation,
  type InsertFoodItem,
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.SessionStore;
  
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private locations: Map<number, Location>;
  private foodItems: Map<number, FoodItem>;
  sessionStore: session.SessionStore;
  private userId: number;
  private locationId: number;
  private foodItemId: number;

  constructor() {
    this.users = new Map();
    this.locations = new Map();
    this.foodItems = new Map();
    this.userId = 1;
    this.locationId = 1;
    this.foodItemId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Location operations
  async getLocations(userId: number): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(
      (location) => location.userId === userId,
    );
  }

  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async createLocation(
    location: InsertLocation & { userId: number },
  ): Promise<Location> {
    const id = this.locationId++;
    const newLocation = { ...location, id };
    this.locations.set(id, newLocation);
    return newLocation;
  }

  async updateLocation(
    id: number,
    location: Partial<InsertLocation>,
  ): Promise<Location> {
    const existing = this.locations.get(id);
    if (!existing) throw new Error("Location not found");
    const updated = { ...existing, ...location };
    this.locations.set(id, updated);
    return updated;
  }

  async deleteLocation(id: number): Promise<void> {
    this.locations.delete(id);
  }

  // Food item operations
  async getFoodItems(userId: number): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values()).filter(
      (item) => item.userId === userId,
    );
  }

  async getFoodItem(id: number): Promise<FoodItem | undefined> {
    return this.foodItems.get(id);
  }

  async createFoodItem(
    item: InsertFoodItem & { userId: number },
  ): Promise<FoodItem> {
    const id = this.foodItemId++;
    const newItem = { ...item, id, purchased: new Date() };
    this.foodItems.set(id, newItem);
    return newItem;
  }

  async updateFoodItem(
    id: number,
    item: Partial<InsertFoodItem>,
  ): Promise<FoodItem> {
    const existing = this.foodItems.get(id);
    if (!existing) throw new Error("Food item not found");
    const updated = { ...existing, ...item };
    this.foodItems.set(id, updated);
    return updated;
  }

  async deleteFoodItem(id: number): Promise<void> {
    this.foodItems.delete(id);
  }
}

export const storage = new MemStorage();
