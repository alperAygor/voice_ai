export type BillingInvoiceStatus = "draft" | "open" | "paid" | "uncollectible" | "void";

export type BillingInvoice = {
  id: string;
  amountDueUsd: string;
  status: BillingInvoiceStatus | null;
  hostedInvoiceUrl: string | null;
  createdAt: string;
};

export function formatStripeAmountUsd(amountInCents: number | null | undefined): string {
  return `$${((amountInCents ?? 0) / 100).toFixed(2)}`;
}

export function formatUnixTimestampDate(timestampSeconds: number): string {
  return new Date(timestampSeconds * 1000).toISOString();
}

export function getInvoiceStatusLabel(status: BillingInvoiceStatus | null): string {
  switch (status) {
    case "paid":
      return "Ödendi";
    case "open":
      return "Bekliyor";
    case "draft":
      return "Taslak";
    case "uncollectible":
      return "Tahsil edilemedi";
    case "void":
      return "İptal";
    default:
      return "Bilinmiyor";
  }
}
