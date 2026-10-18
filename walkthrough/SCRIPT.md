# Ledger Lane — words for the room

One scene, on `main`. Read this beside [DEMO.md](DEMO.md). Have ChangeGraph open on Activity, the shop at http://localhost:5174, and `main` already selected and indexed with the retry guard present. Incidents already loaded. `npm test` is green.

## Open

"This is Ledger Lane, a stationery counter. The page is React. The book is a small API in memory. There is no database.

ChangeGraph is watching `main` on the GitHub repository. It has a code graph for this project: functions, calls, tests, and services. When I push a commit to `main`, it ingests that commit, writes an impact report, and a reviewer reads the graph. If the review has something it can safely repair, a developer agent opens a pull request on its own branch. A person merges it. The agent does not merge, and it does not push to `main`."

Click through the safe shop while you say it.

"Notebook, card 4242, place the order. Paid, one ledger line, stock 7."

"Card 0000 on a pen. The card is declined, stock stays reserved, and the ledger stays empty. On the receipt I choose Retry payment. One retry line. Retry again. The same line comes back. A second retry does not write another entry."

## The change

"That memory is a guard at the top of `retryPayment`. I am taking it out, on `main`."

```bash
./walkthrough/demo.sh apply --commit --push
```

While the poll catches the push:

"Checkout calls `retryPayment` from the controller. The function writes a ledger line, warns on a duplicate, sends a notification, and audits the retry. Nothing in the test folder calls `retryPayment` directly."

In the shop: card `0000`, then **Retry payment**, then **Retry again**.

"Two ledger lines for one retry. `npm test` is still green, because the tests never press this button."

## The review

On Activity, open the run.

"Ingest, then the impact report, then the reviewer. The score is 79, CRITICAL. One function changed. One caller, `retryFailedPayment`. Downstream, the ledger, the retry warning, the notification, and the audit. The call leaves `PaymentService`. No direct test. And this project has a synthetic incident, loaded on purpose, about duplicate ledger lines during retries. It is labeled synthetic. The score treats it as a reason to look.

The reviewer asks for the guard back. The developer agent can see the deleted `if` that returned the previous retry. It opens a pull request on `changegraph/fix-*` that puts those lines back. I am leaving that pull request open."

Open the pull request. Show the restored guard. Show that `main` did not receive the fix.

## Close

"One commit on `main`. The graph says who calls the function, what it calls, that no test calls it, and that a past incident sits on it. The pull request puts the guard back and waits."

## If they ask

- The first sync after selecting `main` does not review history. This commit is the one that does.
- The incident is synthetic and labeled that way. It is attached to `retryPayment`.
- With no model key, this pull request is the deleted guard put back. A model key may also add a test. Either way a person reviews it.
