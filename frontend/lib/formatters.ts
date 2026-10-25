/**
 * Display formatters for currency, dates, and labels
 */

export function formatCurrencyINR(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "₹0";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatEventDate(startDate?: string, endDate?: string, dateType?: string): string {
  if (!startDate) return "Date not specified";

  try {
    const start = new Date(startDate);
    const startFormatted = start.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    if (dateType === "range" && endDate) {
      const end = new Date(endDate);
      const endFormatted = end.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      return `${startFormatted} – ${endFormatted}`;
    }

    return startFormatted;
  } catch {
    return startDate;
  }
}

export function formatDateString(dateStr?: string): string {
  if (!dateStr) return "Not specified";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
