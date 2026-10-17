import { useEffect, useState, type FormEvent } from "react";
import { formatLanePrice, loadCatalog, postCheckout, type LaneProduct } from "./lane-client";

export function CheckoutPage({
  sku,
  onBack,
  onPlaced,
}: {
  sku: string;
  onBack: () => void;
  onPlaced: (orderId: string) => void;
}) {
  const [product, setProduct] = useState<LaneProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cardLast4, setCardLast4] = useState("4242");
  const [problem, setProblem] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    loadCatalog()
      .then((items) => {
        let found: LaneProduct | null = null;
        let index = 0;
        while (index < items.length) {
          if (items[index].sku === sku) {
            found = items[index];
          }
          index = index + 1;
        }
        setProduct(found);
      })
      .catch(() => setProblem("The shop counter is not answering."));
  }, [sku]);

  async function placeLaneOrder(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setProblem("");
    try {
      const order = await postCheckout(sku, quantity, cardLast4);
      onPlaced(order.id);
    } catch {
      setProblem("The order did not go through.");
      setPending(false);
    }
  }

  const stock = product ? product.stock : 1;

  return (
    <main className="sheet narrow">
      <p className="kicker">Counter</p>
      <h1>{product ? product.name : "Checkout"}</h1>
      {product ? <p>{product.blurb}</p> : null}
      <form className="ticket" onSubmit={placeLaneOrder}>
        <label>
          Quantity
          <input
            type="number"
            min={1}
            max={stock}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />
        </label>
        <label>
          Card, last four
          <input
            inputMode="numeric"
            maxLength={4}
            value={cardLast4}
            onChange={(event) => setCardLast4(event.target.value)}
          />
        </label>
        <p className="hint">Use 0000 to decline the card. Any other four digits are captured.</p>
        {product ? <p className="due">Due {formatLanePrice(product.priceCents * quantity)}</p> : null}
        {problem ? <p className="problem">{problem}</p> : null}
        <div className="actions">
          <button type="button" className="quiet" onClick={onBack}>
            Back to the desk
          </button>
          <button type="submit" disabled={pending || cardLast4.length !== 4}>
            {pending ? "Writing the order" : "Place order"}
          </button>
        </div>
      </form>
    </main>
  );
}
