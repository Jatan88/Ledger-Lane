import { useEffect, useState } from "react";
import { formatLanePrice, postRefund, postRetry, showReceipt, type LaneReceipt } from "./lane-client";

const statusLabel: { [status: string]: string } = {
  paid: "Paid",
  payment_failed: "Card declined",
  refunded: "Refunded",
  out_of_stock: "Out of stock",
};

export function ReceiptPage({ orderId, onShop }: { orderId: string; onShop: () => void }) {
  const [receipt, setReceipt] = useState<LaneReceipt | null>(null);
  const [problem, setProblem] = useState("");
  const [pending, setPending] = useState(false);

  function loadLaneReceipt(id: string) {
    return showReceipt(id)
      .then((next) => {
        setReceipt(next);
        setProblem("");
      })
      .catch(() => setProblem("That receipt is not in the book."));
  }

  useEffect(() => {
    loadLaneReceipt(orderId);
  }, [orderId]);

  async function retryLanePayment() {
    if (!receipt?.payment) {
      return;
    }
    setPending(true);
    setProblem("");
    try {
      await postRetry(receipt.payment.id);
      await loadLaneReceipt(orderId);
    } catch {
      setProblem("The retry did not post.");
    }
    setPending(false);
  }

  async function refundLaneOrder() {
    setPending(true);
    setProblem("");
    try {
      await postRefund(orderId);
      await loadLaneReceipt(orderId);
    } catch {
      setProblem("The refund did not post.");
    }
    setPending(false);
  }

  const order = receipt?.order;
  const retryLine = receipt?.ledger.some((entry) => entry.kind === "retry");
  const canRetry =
    order && order.paymentId && (order.status === "payment_failed" || (order.status === "paid" && retryLine));
  const canRefund = order && order.paymentId && order.status !== "refunded" && order.status !== "out_of_stock";

  return (
    <main className="sheet narrow">
      <p className="kicker">Receipt {orderId}</p>
      <h1>{order ? statusLabel[order.status] ?? order.status : "Receipt"}</h1>
      {problem ? <p className="problem">{problem}</p> : null}
      {!receipt && !problem ? <p className="muted">Pulling the receipt.</p> : null}
      {order ? (
        <section className="ticket">
          <p>
            {order.quantity} × {order.sku} · card {order.cardLast4}
          </p>
          <p className="due">{formatLanePrice(order.amountCents)}</p>
          <h2>Ledger</h2>
          {receipt && receipt.ledger.length === 0 ? <p className="muted">No ledger line yet.</p> : null}
          <ul className="lines">
            {receipt?.ledger.map((entry) => (
              <li key={entry.id}>
                <span>{entry.kind}</span>
                <span>{entry.id}</span>
                <span>{formatLanePrice(entry.amountCents)}</span>
              </li>
            ))}
          </ul>
          {retryLine ? <p className="hint">A second retry returns the existing ledger line.</p> : null}
          <div className="actions">
            <button type="button" className="quiet" onClick={onShop}>
              Back to the desk
            </button>
            {canRetry ? (
              <button type="button" disabled={pending} onClick={retryLanePayment}>
                {order.status === "payment_failed" ? "Retry payment" : "Retry again"}
              </button>
            ) : null}
            {canRefund ? (
              <button type="button" className="quiet" disabled={pending} onClick={refundLaneOrder}>
                Refund order
              </button>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
