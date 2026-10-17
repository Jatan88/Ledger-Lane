import { useEffect, useState } from "react";
import { formatLanePrice, loadCatalog, type LaneProduct } from "./lane-client";

export function CatalogPage({ onPick }: { onPick: (sku: string) => void }) {
  const [products, setProducts] = useState<LaneProduct[]>([]);
  const [problem, setProblem] = useState("");

  useEffect(() => {
    loadCatalog()
      .then((items) => {
        setProducts(items);
        setProblem("");
      })
      .catch(() => setProblem("The shop counter is not answering."));
  }, []);

  return (
    <main className="sheet">
      <p className="kicker">Counter</p>
      <h1>What we have on the desk</h1>
      {problem ? <p className="problem">{problem}</p> : null}
      {!problem && products.length === 0 ? <p className="muted">Bringing the stock book up.</p> : null}
      <ul className="goods">
        {products.map((product) => (
          <li key={product.sku}>
            <article className="slip">
              <div>
                <h2>{product.name}</h2>
                <p>{product.blurb}</p>
              </div>
              <div className="slip-foot">
                <span>{formatLanePrice(product.priceCents)}</span>
                <span className="muted">{product.stock} on hand</span>
                <button type="button" disabled={product.stock < 1} onClick={() => onPick(product.sku)}>
                  Take to the counter
                </button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </main>
  );
}
