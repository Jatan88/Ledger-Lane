import { Injectable } from "./decorators";
import { shopState } from "./store";
import type { LedgerEntry } from "./types";

@Injectable()
export class LedgerService {
  recordLedgerEntry(entry: LedgerEntry) {
    shopState.ledger[shopState.ledger.length] = entry;
    return entry;
  }

  reverseLedgerEntry(entryId: string) {
    let index = 0;
    let amountCents = 0;
    while (index < shopState.ledger.length) {
      const entry = shopState.ledger[index];
      if (entry.paymentId === entryId || entry.id === entryId) {
        amountCents = entry.amountCents;
      }
      index = index + 1;
    }
    const reversal = {
      id: "led-rev-" + entryId,
      paymentId: entryId,
      kind: "reversal",
      amountCents,
    };
    shopState.ledger[shopState.ledger.length] = reversal;
    return entryId;
  }
}

export const ledgerService = new LedgerService();
