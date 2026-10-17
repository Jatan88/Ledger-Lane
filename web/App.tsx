import { useState } from "react";
import { CatalogPage } from "./CatalogPage";
import { CheckoutPage } from "./CheckoutPage";
import { ReceiptPage } from "./ReceiptPage";

type LaneScreen = "catalog" | "checkout" | "receipt";

export function App() {
  const [screen, setScreen] = useState<LaneScreen>("catalog");
  const [chosenSku, setChosenSku] = useState("notebook");
  const [receiptId, setReceiptId] = useState("");

  function openCheckout(sku: string) {
    setChosenSku(sku);
    setScreen("checkout");
  }

  function openReceipt(orderId: string) {
    setReceiptId(orderId);
    setScreen("receipt");
  }

  return (
    <div className="lane">
      <header className="mast">
        <button className="wordmark" type="button" onClick={() => setScreen("catalog")}>
          Ledger Lane
        </button>
        <p>Stationery, paid and posted to the book.</p>
      </header>
      {screen === "catalog" ? <CatalogPage onPick={openCheckout} /> : null}
      {screen === "checkout" ? (
        <CheckoutPage sku={chosenSku} onBack={() => setScreen("catalog")} onPlaced={openReceipt} />
      ) : null}
      {screen === "receipt" ? <ReceiptPage orderId={receiptId} onShop={() => setScreen("catalog")} /> : null}
    </div>
  );
}
