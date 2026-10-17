export interface CheckoutOrder {
  sku: string;
  quantity: number;
  cardLast4: string;
}

export interface Payment {
  id: string;
  orderId: string;
  sku: string;
  quantity: number;
  amountCents: number;
  status: string;
  cardLast4: string;
}

export interface LedgerEntry {
  id: string;
  paymentId: string;
  kind: string;
  amountCents: number;
}

export interface ShopOrder {
  id: string;
  sku: string;
  quantity: number;
  cardLast4: string;
  status: string;
  paymentId: string;
  amountCents: number;
}

export interface CatalogItem {
  sku: string;
  name: string;
  blurb: string;
  priceCents: number;
  stock: number;
}

export interface Receipt {
  order: ShopOrder | null;
  payment: Payment | null;
  ledger: LedgerEntry[];
  notifications: string[];
  audits: string[];
}
