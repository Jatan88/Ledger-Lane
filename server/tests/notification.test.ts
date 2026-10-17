import assert from "node:assert/strict";
import { test } from "node:test";
import { notificationService } from "../notification-service";
import { resetShopState, shopState } from "../store";

test("notifyPayment sends a capture notification", () => {
  resetShopState();
  const paymentId = notificationService.notifyPayment({
    id: "pay-9",
    orderId: "ord-9",
    sku: "pen",
    quantity: 1,
    amountCents: 4200,
    status: "captured",
    cardLast4: "4242",
  });
  assert.equal(paymentId, "pay-9");
  assert.equal(shopState.notifications.length, 1);
});

test("sendNotification keeps the message", () => {
  resetShopState();
  const message = notificationService.sendNotification("Payment pay-9 captured");
  assert.equal(message, "Payment pay-9 captured");
  assert.equal(shopState.notifications[0], "Payment pay-9 captured");
});
