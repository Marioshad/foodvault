import { Router } from 'express';
import { setupAuthRoutes } from './auth';
import { setupFoodItemRoutes } from './food-items';
import { setupLocationRoutes } from './locations';
import { setupReceiptRoutes } from './receipts';

export function setupRoutes(app: Router) {
  setupAuthRoutes(app);
  setupFoodItemRoutes(app);
  setupLocationRoutes(app);
  setupReceiptRoutes(app);
}
