export interface LaneProduct {
  sku: string;
  name: string;
  blurb: string;
  priceCents: number;
  stock: number;
}

export interface LaneOrder {
  id: string;
  sku: string;
  quantity: number;
  cardLast4: string;
  status: string;
  paymentId: string;
  amountCents: number;
}

export interface LaneEntry {
  id: string;
  paymentId: string;
  kind: string;
  amountCents: number;
}

export interface LaneReceipt {
  order: LaneOrder;
  payment: {
    id: string;
    status: string;
    cardLast4: string;
    amountCents: number;
  } | null;
  ledger: LaneEntry[];
  notifications: string[];
  audits: string[];
}

export function formatLanePrice(cents: number) {
  const dollars = Math.floor(cents / 100);
  const remainder = cents % 100;
  const padded = remainder < 10 ? "0" + remainder : "" + remainder;
  return "$" + dollars + "." + padded;
}

export async function loadCatalog(): Promise<LaneProduct[]> {
  const response = await fetch("/api/catalog");
  if (!response.ok) {
    throw new Error("catalog unavailable");
  }
  return response.json();
}

export async function postCheckout(sku: string, quantity: number, cardLast4: string): Promise<LaneOrder> {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sku, quantity, cardLast4 }),
  });
  if (!response.ok) {
    throw new Error("checkout failed");
  }
  return response.json();
}

export async function showReceipt(orderId: string): Promise<LaneReceipt> {
  const response = await fetch("/api/orders/" + orderId);
  if (!response.ok) {
    throw new Error("receipt unavailable");
  }
  return response.json();
}

export async function postRetry(paymentId: string) {
  const response = await fetch("/api/payments/" + paymentId + "/retry", { method: "POST" });
  if (!response.ok) {
    throw new Error("retry failed");
  }
  return response.json();
}

export async function postRefund(orderId: string) {
  const response = await fetch("/api/orders/" + orderId + "/refund", { method: "POST" });
  if (!response.ok) {
    throw new Error("refund failed");
  }
  return response.json();
}
