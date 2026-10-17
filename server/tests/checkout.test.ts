import assert from "node:assert/strict";
import { test } from "node:test";
import { checkoutService } from "../checkout-service";
import { resetShopState, shopState } from "../store";

test("submitCheckout reserves stock and captures payment", () => {
  resetShopState();
  const order = checkoutService.submitCheckout({
    sku: "notebook",
    quantity: 1,
    cardLast4: "4242",
  });
  assert.equal(order.status, "paid");
  assert.equal(order.amountCents, 1800);
  assert.equal(shopState.stock.notebook, 7);
  assert.equal(shopState.ledger.length, 1);
  assert.equal(shopState.notifications.length, 1);
});

test("submitCheckout holds reserved stock when the card is declined", () => {
  resetShopState();
  const order = checkoutService.submitCheckout({
    sku: "pen",
    quantity: 1,
    cardLast4: "0000",
  });
  assert.equal(order.status, "payment_failed");
  assert.equal(shopState.stock.pen, 4);
  assert.equal(shopState.ledger.length, 0);
});
