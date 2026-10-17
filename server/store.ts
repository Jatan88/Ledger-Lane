import type { LedgerEntry, Payment, ShopOrder } from "./types";

export const openingStock = {
  notebook: 8,
  pen: 5,
  ink: 6,
};

export const shopState = {
  products: [
    {
      sku: "notebook",
      name: "Field notebook",
      blurb: "Sixty-four plain pages, stitched, for lists that should stay put.",
      priceCents: 1800,
    },
    {
      sku: "pen",
      name: "Brass pen",
      blurb: "A pocket pen with enough weight to finish the line.",
      priceCents: 4200,
    },
    {
      sku: "ink",
      name: "Walnut ink set",
      blurb: "Three small bottles for corrections and fresh entries.",
      priceCents: 1600,
    },
  ],
  stock: {
    notebook: openingStock.notebook,
    pen: openingStock.pen,
    ink: openingStock.ink,
  } as { [sku: string]: number },
  orders: {} as { [orderId: string]: ShopOrder },
  payments: {} as { [paymentId: string]: Payment },
  ledger: [] as LedgerEntry[],
  notifications: [] as string[],
  audits: [] as string[],
  retries: {} as { [paymentId: string]: LedgerEntry | undefined },
  orderSequence: 0,
  paymentSequence: 0,
};

export function resetShopState() {
  shopState.stock.notebook = openingStock.notebook;
  shopState.stock.pen = openingStock.pen;
  shopState.stock.ink = openingStock.ink;
  shopState.orders = {};
  shopState.payments = {};
  shopState.ledger = [];
  shopState.notifications = [];
  shopState.audits = [];
  shopState.retries = {};
  shopState.orderSequence = 0;
  shopState.paymentSequence = 0;
}
