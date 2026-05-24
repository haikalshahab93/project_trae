import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { Transfer } from "../models/Transfer.js";

export const dashboardRouter = express.Router();

dashboardRouter.get("/summary", requireAuth, async (req, res, next) => {
  try {
    const [transferCount, transfers] = await Promise.all([
      Transfer.countDocuments({ user: req.user._id }),
      Transfer.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5),
    ]);

    const totalProfit = transfers.reduce(
      (total, transfer) => total + Number(transfer.profitEstimate || 0),
      0,
    );

    const totalVolume = transfers.reduce(
      (total, transfer) => total + Number(transfer.amount || 0),
      0,
    );

    res.json({
      user: {
        fullName: req.user.fullName,
        email: req.user.email,
        kycStatus: req.user.kyc?.status || "not_submitted",
      },
      summary: {
        transferCount,
        totalProfit,
        totalVolume,
      },
      recentTransfers: transfers,
    });
  } catch (error) {
    next(error);
  }
});
