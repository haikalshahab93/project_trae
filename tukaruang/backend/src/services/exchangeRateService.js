import axios from "axios";
import { env } from "../config/env.js";
import { CurrencyPairConfig } from "../models/CurrencyPairConfig.js";

const currencyNameFormatter =
  typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["en"], { type: "currency" })
    : null;

const normalizeRateFromPayload = (payload, fromCurrency, toCurrency) => {
  if (payload?.rates?.[toCurrency]) {
    return Number(payload.rates[toCurrency]);
  }

  if (payload?.conversion_rates?.[toCurrency]) {
    return Number(payload.conversion_rates[toCurrency]);
  }

  if (payload?.quotes?.[`${fromCurrency}${toCurrency}`]) {
    return Number(payload.quotes[`${fromCurrency}${toCurrency}`]);
  }

  if (payload?.result) {
    return Number(payload.result);
  }

  return null;
};

export const fetchLiveRate = async (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return {
      provider: "internal-parity",
      marketRate: 1,
      fetchedAt: new Date().toISOString(),
    };
  }

  if (env.exchangeRateApiKey) {
    try {
      const response = await axios.get(`${env.exchangeRateBaseUrl}/latest`, {
        params: {
          access_key: env.exchangeRateApiKey,
          base: fromCurrency,
          symbols: toCurrency,
        },
        timeout: 10000,
      });

      const rate = normalizeRateFromPayload(
        response.data,
        fromCurrency,
        toCurrency,
      );

      if (rate) {
        return {
          provider: env.exchangeRateProvider,
          marketRate: rate,
          fetchedAt:
            response.data?.date ||
            response.data?.timestamp ||
            new Date().toISOString(),
        };
      }
    } catch (error) {
      console.warn("Primary exchange provider failed, fallback will be used.");
    }
  }

  const fallback = await axios.get(`https://open.er-api.com/v6/latest/${fromCurrency}`, {
    timeout: 10000,
  });

  const marketRate = Number(fallback.data?.rates?.[toCurrency]);

  if (!marketRate) {
    throw new Error(`Kurs ${fromCurrency}/${toCurrency} tidak tersedia.`);
  }

  return {
    provider: "open-er-api-fallback",
    marketRate,
    fetchedAt: fallback.data?.time_last_update_utc || new Date().toISOString(),
  };
};

export const fetchAvailableCurrencies = async (search = "") => {
  const normalizedSearch = String(search || "").trim().toUpperCase();

  let currencyCodes = [];

  if (env.exchangeRateApiKey) {
    try {
      const response = await axios.get(`${env.exchangeRateBaseUrl}/latest`, {
        params: {
          access_key: env.exchangeRateApiKey,
          base: "USD",
        },
        timeout: 10000,
      });

      currencyCodes = Object.keys(
        response.data?.rates || response.data?.conversion_rates || {},
      );
    } catch (error) {
      console.warn("Primary currency list provider failed, fallback will be used.");
    }
  }

  if (currencyCodes.length === 0) {
    const fallback = await axios.get("https://open.er-api.com/v6/latest/USD", {
      timeout: 10000,
    });
    currencyCodes = Object.keys(fallback.data?.rates || {});
  }

  const prioritizedCodes = [...new Set(["QAR", "IDR", ...currencyCodes])]
    .filter(Boolean)
    .sort((left, right) => {
      const leftPriority = left === "QAR" ? -2 : left === "IDR" ? -1 : 0;
      const rightPriority = right === "QAR" ? -2 : right === "IDR" ? -1 : 0;
      return leftPriority - rightPriority || left.localeCompare(right);
    });

  return prioritizedCodes
    .map((code) => ({
      code,
      name: currencyNameFormatter?.of(code) || code,
      symbol: code,
    }))
    .filter(
      (currency) =>
        !normalizedSearch ||
        currency.code.includes(normalizedSearch) ||
        currency.name.toUpperCase().includes(normalizedSearch),
    );
};

export const buildQuote = async ({
  amount,
  fromCurrency,
  toCurrency,
  markupPercent,
  rateAdjustmentValue,
  adminFee,
}) => {
  const normalizedAmount = Number(amount || 0);

  if (!normalizedAmount || normalizedAmount <= 0) {
    throw new Error("Jumlah transfer harus lebih besar dari 0.");
  }

  const { marketRate, provider, fetchedAt } = await fetchLiveRate(
    fromCurrency,
    toCurrency,
  );

  const pairConfig = await CurrencyPairConfig.findOne({
    fromCurrency,
    toCurrency,
    isActive: true,
  }).lean();

  const resolvedMarkupPercent =
    markupPercent ?? pairConfig?.markupPercent ?? env.defaultMarkupPercent;
  const resolvedRateAdjustmentValue =
    rateAdjustmentValue ??
    pairConfig?.rateAdjustmentValue ??
    env.defaultRateAdjustmentValue;
  const resolvedAdminFee =
    adminFee ?? pairConfig?.serviceFee ?? env.defaultServiceFee;

  const markupValue = marketRate * (Number(resolvedMarkupPercent) / 100);
  const displayRate = Math.max(
    marketRate - markupValue - Number(resolvedRateAdjustmentValue),
    0.000001,
  );
  const receiveAmount = normalizedAmount * displayRate;
  const totalPayable = normalizedAmount + Number(resolvedAdminFee);
  const profitEstimate = (marketRate - displayRate) * normalizedAmount;

  return {
    provider,
    fetchedAt,
    marketRate,
    displayRate,
    markupPercent: Number(resolvedMarkupPercent),
    rateAdjustmentValue: Number(resolvedRateAdjustmentValue),
    adminFee: Number(resolvedAdminFee),
    amount: normalizedAmount,
    receiveAmount,
    totalPayable,
    profitEstimate,
    feeCurrency: fromCurrency,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  };
};
