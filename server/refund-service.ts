import { Injectable } from "./decorators";
import { inventoryService } from "./inventory-service";
import { ledgerService } from "./ledger-service";
import { shopState } from "./store";

@Injectable()
export class RefundService {
  refundOrder(orderId: string) {
    const order = shopState.orders[orderId];
    ledgerService.reverseLedgerEntry(order.paymentId);
    inventoryService.releaseStock(order.sku, order.quantity);
    order.status = "refunded";
    return order;
  }
}

export const refundService = new RefundService();
