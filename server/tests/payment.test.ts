import assert from "node:assert/strict";
import { test } from "node:test";
import { paymentService } from "../payment-service";
import { resetShopState, shopState } from "../store";

test("capturePayment records a ledger line for an accepted card", () => {
  resetShopState();
  const payment = paymentService.capturePayment({
    id: "",
    orderId: "ord-1",
    sku: "notebook",
    quantity: 1,
    amountCents: 1800,
    status: "pending",
    cardLast4: "4242",
  });
  assert.equal(payment.status, "captured");
  assert.equal(shopState.ledger.length, 1);
  assert.equal(shopState.ledger[0].kind, "capture");
});

test("capturePayment leaves the ledger empty when the card is declined", () => {
  resetShopState();
  const payment = paymentService.capturePayment({
    id: "",
    orderId: "ord-2",
    sku: "ink",
    quantity: 1,
    amountCents: 1600,
    status: "pending",
    cardLast4: "0000",
  });
  assert.equal(payment.status, "failed");
  assert.equal(shopState.ledger.length, 0);
});
