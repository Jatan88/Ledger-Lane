# Ledger Lane demo

One scene, on `main`: remove the retry guard, watch ChangeGraph score it critical, and leave the fix pull request open.

The words are in [SCRIPT.md](SCRIPT.md). The edit is [patches/02-drop-retry-idempotency.patch](patches/02-drop-retry-idempotency.patch).

## Before the room

ChangeGraph is up (`docker compose up --build` in the ChangeGraph repo, then http://localhost:8080). `.env` has `GITHUB_TOKEN` with contents write and pull request write on this public repository. Leave `CHANGEGRAPH_LLM_API_KEY` empty. The pull request then puts the guard back and stays open for a person. A model key may also add a test.

`main` today already has the guard removed. Put it back and push that baseline before ChangeGraph records the tip:

```bash
./walkthrough/demo.sh prepare --commit --push
```

In ChangeGraph:

1. Register, create a project, and wait until the graph is ready.
2. Connect `https://github.com/Jatan88/Ledger-Lane`.
3. Select `main`. Wait until the sync run on Activity finishes. That run indexes the shop and does not open a pull request.
4. Open Incidents and choose **Load demo examples**.

If ChangeGraph is already watching `main` at the commit that removed the guard, the prepare push is its own run. Let that run finish, then do the scene below. The scene is the next push.

On localhost the next poll is about a minute. Push, then talk, then refresh Activity.

Start the shop from this directory:

```bash
npm install
npm test
npm run dev
```

The counter is http://localhost:5174. Confirm the safe retry once: card `0000`, **Retry payment**, **Retry again**. One ledger line comes back the second time. `npm test` is green.

## The scene

```bash
./walkthrough/demo.sh apply --commit --push
```

`retryPayment` loses the guard that returns the previous retry. The commit is on `main`.

In the shop, repeat the declined card and the two retries. The receipt shows two ledger lines. `npm test` stays green, because no test calls `retryPayment`.

On Activity, the run should show:

- `retryPayment` modified
- caller `retryFailedPayment`
- downstream `recordLedgerEntry`, `warnDuplicateLedger`, `sendNotification`, and `auditPaymentRetry`
- a service boundary, because those functions sit on other annotated services
- no direct test
- the synthetic retry incident, still labeled synthetic

Downstream points stop at 24, so four functions score the same as three. The total is 12 + 6 + 24 + 12 + 10 + 10 + 5 = 79, CRITICAL. One changed function, one caller, the downstream cap, the service boundary, the missing test, the verified synthetic incident, and the parser limitation recorded on every ingest. The number is a review priority.

The developer agent opens a `changegraph/fix-*` pull request that puts the `if` / `return` back. It is not merged, and it is not pushed to `main`.

## Stock scene

Same shape, on `main`, for the shelf check. `reserveStock` on the current tip already sells past the stock count and still calls `warnOversell`. Put the check back, let ChangeGraph index that commit, then remove only the check:

```bash
./walkthrough/demo.sh prepare 01 --commit --push
```

Select `main` and wait for the sync. Then:

```bash
./walkthrough/demo.sh apply 01 --commit --push
```

The page will not order nine pens. The API will:

```bash
curl -s -X POST http://localhost:3040/api/checkout \
  -H 'content-type: application/json' \
  -d '{"sku":"pen","quantity":9,"cardLast4":"4242"}'
```

Pens start at 5. With the guard, the order is `out_of_stock` and the shelf stays at 5. After the demo commit, the order is paid and the shelf goes negative. `npm test` stays green.

The review shows `reserveStock` modified. Callers include `submitCheckout` and `acceptCheckout`. `warnOversell` stays downstream, on another annotated service. No direct test, and the retry incident stays off this report. Expect HIGH, around 59: one function, two callers, one downstream function, the service boundary, the missing test, and the parser limitation. The pull request puts the stock `if` / `return` back and leaves the warning call for a person to judge.

## Refund scene

Same shape, on `main`, for an empty reversal. `reverseLedgerEntry` still returns early when the amount is zero, so this guard is already on the tip. The demo commit is the removal:

```bash
./walkthrough/demo.sh apply 03 --commit --push
```

`./walkthrough/demo.sh prepare 03 --commit --push` puts the guard back after the scene.

In the shop, card `0000`, then **Refund order**. The safe shop returns the stock and leaves the ledger empty. After the commit, the ledger gains a reversal of $0.00. `npm test` stays green.

The review shows `reverseLedgerEntry` modified. Callers are `refundOrder` and `acceptRefund`, on other annotated services. Nothing is downstream. No direct test, and the retry incident stays off this report. Expect HIGH, around 51: one function, two callers, the service boundary, the missing test, and the parser limitation. The pull request puts the zero-amount `if` / `return` back.
