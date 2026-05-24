export const formatMoney = (value, currency = "IDR") =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(Number(value || 0));

export const formatNumber = (value) =>
  new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
