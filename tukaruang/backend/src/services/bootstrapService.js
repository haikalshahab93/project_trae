import { env } from "../config/env.js";
import { CurrencyPairConfig } from "../models/CurrencyPairConfig.js";
import { User } from "../models/User.js";

export const ensureDefaultAdmin = async () => {
  const existingAdmin = await User.findOne({ email: env.defaultAdminEmail });

  if (existingAdmin) {
    return existingAdmin;
  }

  const admin = await User.create({
    role: "admin",
    email: env.defaultAdminEmail,
    password: env.defaultAdminPassword,
    fullName: env.defaultAdminName,
    phone: "+0000000000",
    kyc: {
      status: "approved",
      faceVerificationStatus: "verified",
      reviewedBy: env.defaultAdminName,
      reviewedAt: new Date(),
    },
  });

  console.log(`Default admin created: ${admin.email}`);
  return admin;
};

export const ensureDefaultCurrencyPairConfigs = async () => {
  const defaults = [
    {
      fromCurrency: "QAR",
      toCurrency: "IDR",
      markupPercent: 0,
      rateAdjustmentValue: 0,
      serviceFee: 20,
    },
    {
      fromCurrency: "IDR",
      toCurrency: "QAR",
      markupPercent: 0,
      rateAdjustmentValue: 0,
      serviceFee: 85000,
    },
  ];

  await Promise.all(
    defaults.map(async (config) => {
      await CurrencyPairConfig.findOneAndUpdate(
        { fromCurrency: config.fromCurrency, toCurrency: config.toCurrency },
        { $setOnInsert: config },
        { upsert: true, new: true },
      );
    }),
  );
};
