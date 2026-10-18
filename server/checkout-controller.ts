import { checkoutService } from "./checkout-service";
import { Controller } from "./decorators";
import { paymentService } from "./payment-service";
import { refundService } from "./refund-service";
import { shopState } from "./store";
import type { CatalogItem, CheckoutOrder, Receipt } from "./types";

@Controller()
export class CheckoutController {
  listCatalog() {
    const items: CatalogItem[] = [];
    let index = 0;
    while (index < shopState.products.length) {
      const product = shopState.products[index];
      items[index] = {
        sku: product.sku,
        name: product.name,
        blurb: product.blurb,
        priceCents: product.priceCents,
        stock: shopState.stock[product.sku] ?? 0,
      };
      index = index + 1;
    }
    return items;
  }

  acceptCheckout(order: CheckoutOrder) {
    return checkoutService.submitCheckout(order);
  }

  retryFailedPayment(paymentId: string) {
    return paymentService.retryPayment(paymentId);
  }

  acceptRefund(orderId: string) {
    return refundService.refundOrder(orderId);
  }

  readReceipt(orderId: string): Receipt {
    const order = shopState.orders[orderId];
    const payment = shopState.payments[order.paymentId] ?? null;
    const ledger = [];
    let index = 0;
    let written = 0;
    while (index < shopState.ledger.length) {
      const entry = shopState.ledger[index];
      if (entry.paymentId === order.paymentId) {
        ledger[written] = entry;
        written = written + 1;
      }
      index = index + 1;
    }
    return {
      order,
      payment,
      ledger,
      notifications: shopState.notifications,
      audits: shopState.audits,
    };
  }
}

export const checkoutController = new CheckoutController();
