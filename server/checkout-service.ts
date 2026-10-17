import { Injectable } from "./decorators";
import { inventoryService } from "./inventory-service";
import { notificationService } from "./notification-service";
import { paymentService } from "./payment-service";
import { shopState } from "./store";
import type { CheckoutOrder, ShopOrder } from "./types";

@Injectable()
export class CheckoutService {
  submitCheckout(order: CheckoutOrder) {
    shopState.orderSequence = shopState.orderSequence + 1;
    const orderId = "ord-" + shopState.orderSequence;
    let amountCents = 0;
    let index = 0;
    while (index < shopState.products.length) {
      const product = shopState.products[index];
      if (product.sku === order.sku) {
        amountCents = product.priceCents * order.quantity;
      }
      index = index + 1;
    }
    const reserved = inventoryService.reserveStock(order.sku, order.quantity);
    const captured = reserved
      ? paymentService.capturePayment({
          id: "",
          orderId,
          sku: order.sku,
          quantity: order.quantity,
          amountCents,
          status: "pending",
          cardLast4: order.cardLast4,
        })
      : {
          id: "",
          orderId,
          sku: order.sku,
          quantity: order.quantity,
          amountCents,
          status: "failed",
          cardLast4: order.cardLast4,
        };
    if (reserved && captured.status === "captured") {
      notificationService.notifyPayment(captured);
    }
    const stored: ShopOrder = {
      id: orderId,
      sku: order.sku,
      quantity: order.quantity,
      cardLast4: order.cardLast4,
      status: !reserved ? "out_of_stock" : captured.status === "captured" ? "paid" : "payment_failed",
      paymentId: captured.id,
      amountCents,
    };
    shopState.orders[orderId] = stored;
    return stored;
  }
}

export const checkoutService = new CheckoutService();
