import express from "express";
import { adminRouter } from "./adminRoutes.js";
import { authRouter } from "./authRoutes.js";
import { dashboardRouter } from "./dashboardRoutes.js";
import { kycRouter } from "./kycRoutes.js";
import { rateRouter } from "./rateRoutes.js";
import { transferRouter } from "./transferRoutes.js";

export const apiRouter = express.Router();

apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "API TukarUang berjalan.",
    time: new Date().toISOString(),
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/kyc", kycRouter);
apiRouter.use("/rates", rateRouter);
apiRouter.use("/transfers", transferRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/admin", adminRouter);
