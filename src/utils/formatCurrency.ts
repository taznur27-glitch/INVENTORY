export function formatCurrency(amount: number | string, currency = "USD", locale = "en-US") {
  if (amount === null || amount === undefined || amount === "") return "";
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(n)) return "";
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(n);
  } catch {
    // fallback
    return `${currency} ${n.toFixed(2)}`;
  }
}