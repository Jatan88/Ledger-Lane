import express from "express";
import { checkoutController } from "./checkout-controller";
import { shopState } from "./store";

const app = express();
const port = 3040;

app.use(express.json());

app.get("/api/catalog", (_req, res) => {
  res.json(checkoutController.listCatalog());
});

app.post("/api/checkout", (req, res) => {
  const body = req.body as { sku?: string; quantity?: number; cardLast4?: string };
  if (!body || !body.sku || !body.cardLast4) {
    res.status(400).json({ message: "sku and cardLast4 are required" });
    return;
  }
  const quantity = body.quantity && body.quantity > 0 ? body.quantity : 1;
  const order = checkoutController.acceptCheckout({
    sku: body.sku,
    quantity,
    cardLast4: body.cardLast4,
  });
  res.status(201).json(order);
});

app.get("/api/orders/:orderId", (req, res) => {
  const receipt = checkoutController.readReceipt(req.params.orderId);
  if (!receipt.order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }
  res.json(receipt);
});

app.post("/api/payments/:paymentId/retry", (req, res) => {
  const payment = shopState.payments[req.params.paymentId];
  if (!payment) {
    res.status(404).json({ message: "Payment not found" });
    return;
  }
  const entry = checkoutController.retryFailedPayment(req.params.paymentId);
  res.json(entry);
});

app.post("/api/orders/:orderId/refund", (req, res) => {
  const order = shopState.orders[req.params.orderId];
  if (!order || order.status === "refunded" || order.status === "out_of_stock") {
    res.status(404).json({ message: "Order cannot be refunded" });
    return;
  }
  const refunded = checkoutController.acceptRefund(req.params.orderId);
  res.json(refunded);
});

app.listen(port, () => {
  console.log("Ledger Lane API listening on http://localhost:" + port);
});
