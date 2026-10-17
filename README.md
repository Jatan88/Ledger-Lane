# Ledger Lane

A small stationery shop used to demonstrate [ChangeGraph](https://github.com/Jatan88/ChangeGraph). The counter is a React page. The bookkeeping is an in-memory Express API. There is no database.

Publish this folder as its own public GitHub repository before linking it in ChangeGraph. ChangeGraph ingests a whole repository and stops at 40 source files, so this app stays separate from the ChangeGraph repo.

## Run

```bash
npm install
npm test
npm run dev
```

The shop is at http://localhost:5174. The API is at http://localhost:3040. Vite proxies `/api` to the API.

`npm test` runs the server tests. `npm run typecheck` checks the TypeScript.

## Shop demo

1. Take an item to the counter.
2. Enter card `0000` and place the order. The card is declined, no ledger line is written, and the stock stays reserved for that order.
3. On the receipt, choose **Retry payment**. One retry line is posted and the order is marked paid.
4. Choose **Retry again**. The same ledger line comes back. A second retry does not write another entry.
5. Choose **Refund order**. The stock returns and a reversal line is posted.

Any other four digits are captured on the first try.

## ChangeGraph demo

The server is written so ChangeGraph can follow it. Each function name appears once. Each call passes as many arguments as that function declares. Service classes use `@Injectable()` or `@Controller()`. The service methods do not call library helpers, so those calls are not left unresolved. Tests call `submitCheckout`, `capturePayment`, `recordLedgerEntry`, `notifyPayment`, and `sendNotification`. No test calls `retryPayment`.

```mermaid
flowchart TD
  submitCheckout --> reserveStock
  submitCheckout --> capturePayment
  submitCheckout --> notifyPayment
  capturePayment --> recordLedgerEntry
  notifyPayment --> sendNotification
  retryFailedPayment --> retryPayment
  retryPayment --> recordLedgerEntry
  retryPayment --> sendNotification
  retryPayment --> auditPaymentRetry
  refundOrder --> reverseLedgerEntry
  refundOrder --> releaseStock
```

Synthetic payment incidents attach to `retryPayment`, `recordLedgerEntry`, `sendNotification`, and `notifyPayment`.

1. In ChangeGraph, create a project and link the public repository URL for this folder.
2. Select the default branch and ingest it.
3. Seed the synthetic payment incidents.
4. From this directory, apply the risky edit and commit the TypeScript files it changes. Committing only the patch file does not change a function, so the review does not open a pull request.

```bash
patch -p1 < walkthrough/oversell-stock.patch
```

That removes the stock guard inside `reserveStock` and adds `warnOversell` on a new `OversellWarningService`. Checkout then takes payment for an order even when the shelf does not have enough stock. `releaseStock` is outside the diff. No test calls `reserveStock` or `warnOversell`.

5. Commit and push that edit on the selected branch. Include `server/inventory-service.ts` and `server/oversell-warning-service.ts`.

ChangeGraph detects the push and reviews the graph. The report should show `reserveStock` as modified and `warnOversell` as added. `submitCheckout` calls `reserveStock`, and `acceptCheckout` calls `submitCheckout`. The new warning is downstream. Those functions sit on different annotated services. Neither changed function has a direct test. Those findings are actionable. The Developer Agent opens a `changegraph/fix-*` pull request that puts the stock guard back and adds a test calling the changed function. The pull request is for a person to review. It is not merged, and it is not pushed to the default branch.
