import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tukaruang",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  jwtSecret:
    process.env.JWT_SECRET || "trk_jwt_local_2026_change_me_for_production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  exchangeRateProvider:
    process.env.EXCHANGE_RATE_PROVIDER || "fallback-open-er-api",
  exchangeRateBaseUrl:
    process.env.EXCHANGE_RATE_BASE_URL || "https://api.exchangeratesapi.io/v1",
  exchangeRateApiKey: process.env.EXCHANGE_RATE_API_KEY || "",
  defaultMarkupPercent: Number(process.env.DEFAULT_MARKUP_PERCENT || 0.1),
  defaultRateAdjustmentValue: Number(
    process.env.DEFAULT_RATE_ADJUSTMENT_VALUE || 25,
  ),
  defaultServiceFee: Number(process.env.DEFAULT_SERVICE_FEE || 20),
  internalServiceApiKey:
    process.env.INTERNAL_SERVICE_API_KEY ||
    "trk_internal_local_2026_3D2A5F8C1B",
  defaultAdminName: process.env.DEFAULT_ADMIN_NAME || "Super Admin TukarUang",
  defaultAdminEmail:
    process.env.DEFAULT_ADMIN_EMAIL || "admin@tukaruang.local",
  defaultAdminPassword:
    process.env.DEFAULT_ADMIN_PASSWORD || "Admin12345!",
};
