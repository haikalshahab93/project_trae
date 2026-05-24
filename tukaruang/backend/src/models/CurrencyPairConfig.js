import mongoose from "mongoose";

const currencyPairConfigSchema = new mongoose.Schema(
  {
    fromCurrency: { type: String, required: true, uppercase: true },
    toCurrency: { type: String, required: true, uppercase: true },
    markupPercent: { type: Number, default: 0 },
    rateAdjustmentValue: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

currencyPairConfigSchema.index({ fromCurrency: 1, toCurrency: 1 }, { unique: true });

export const CurrencyPairConfig = mongoose.model(
  "CurrencyPairConfig",
  currencyPairConfigSchema,
);
