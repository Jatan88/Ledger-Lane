import { auditService } from "./audit-service";
import { Injectable } from "./decorators";
import { ledgerService } from "./ledger-service";
import { notificationService } from "./notification-service";
import { shopState } from "./store";
import type { Payment } from "./types";

@Injectable()
export class PaymentService {
  capturePayment(payment: Payment) {
    shopState.paymentSequence = shopState.paymentSequence + 1;
    payment.id = "pay-" + shopState.paymentSequence;
    payment.status = payment.cardLast4 === "0000" ? "failed" : "captured";
    shopState.payments[payment.id] = payment;
    if (payment.status === "captured") {
      ledgerService.recordLedgerEntry({
        id: "led-" + shopState.paymentSequence,
        paymentId: payment.id,
        kind: "capture",
        amountCents: payment.amountCents,
      });
    }
    return payment;
  }

  retryPayment(paymentId: string) {
    const priorRetry = shopState.retries[paymentId];
    if (priorRetry) {
      return priorRetry;
    }
    const payment = shopState.payments[paymentId];
    const entry = {
      id: "led-retry-" + paymentId,
      paymentId,
      kind: "retry",
      amountCents: payment.amountCents,
    };
    ledgerService.recordLedgerEntry(entry);
    notificationService.sendNotification("Retry captured payment " + paymentId);
    auditService.auditPaymentRetry(paymentId);
    payment.status = "captured";
    shopState.retries[paymentId] = entry;
    const order = shopState.orders[payment.orderId];
    if (order) {
      order.status = "paid";
    }
    return entry;
  }
}

export const paymentService = new PaymentService();
