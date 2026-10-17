import assert from "node:assert/strict";
import { test } from "node:test";
import { ledgerService } from "../ledger-service";
import { resetShopState, shopState } from "../store";

test("recordLedgerEntry appends the entry", () => {
  resetShopState();
  const entry = ledgerService.recordLedgerEntry({
    id: "led-1",
    paymentId: "pay-1",
    kind: "capture",
    amountCents: 1800,
  });
  assert.equal(entry.id, "led-1");
  assert.equal(shopState.ledger.length, 1);
  assert.equal(shopState.ledger[0].paymentId, "pay-1");
});
