import { Injectable } from "./decorators";
import { oversellWarningService } from "./oversell-warning-service";
import { shopState } from "./store";

@Injectable()
export class InventoryService {
  reserveStock(sku: string, quantity: number) {
    const available = shopState.stock[sku];
    if (available === undefined || available < quantity) {
      return false;
    }
    shopState.stock[sku] = available - quantity;
    oversellWarningService.warnOversell(sku);
    return true;
  }

  releaseStock(sku: string, quantity: number) {
    const available = shopState.stock[sku];
    const current = available === undefined ? 0 : available;
    shopState.stock[sku] = current + quantity;
    return shopState.stock[sku];
  }
}

export const inventoryService = new InventoryService();
