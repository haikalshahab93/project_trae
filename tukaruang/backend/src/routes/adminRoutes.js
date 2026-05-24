import express from "express";
import { body, validationResult } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { Transfer } from "../models/Transfer.js";
import { User } from "../models/User.js";
import { sanitizeUser } from "../services/authService.js";

export const adminRouter = express.Router();

adminRouter.use(requireAuth, requireRole("admin", "compliance"));

adminRouter.get("/summary", async (req, res, next) => {
  try {
    const [userCount, pendingKycCount, transferCount, transfers] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ "kyc.status": "pending_review" }),
        Transfer.countDocuments(),
        Transfer.find().sort({ createdAt: -1 }).limit(20),
      ]);

    const totalProfit = transfers.reduce(
      (sum, transfer) => sum + Number(transfer.profitEstimate || 0),
      0,
    );
    const totalVolume = transfers.reduce(
      (sum, transfer) => sum + Number(transfer.amount || 0),
      0,
    );

    res.json({
      summary: {
        userCount,
        pendingKycCount,
        transferCount,
        totalProfit,
        totalVolume,
      },
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/users", async (req, res, next) => {
  try {
    const kycStatus = String(req.query.kycStatus || "").trim();
    const keyword = String(req.query.keyword || "").trim();

    const filter = {};

    if (kycStatus) {
      filter["kyc.status"] = kycStatus;
    }

    if (keyword) {
      filter.$or = [
        { fullName: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { "profile.identityNumber": { $regex: keyword, $options: "i" } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 }).limit(50);

    res.json({
      users: users.map((user) => sanitizeUser(user)),
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch(
  "/users/:userId/kyc",
  [
    body("status")
      .isIn(["pending_review", "approved", "rejected"])
      .withMessage("Status KYC tidak valid."),
    body("notes").optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validasi review KYC gagal.",
          errors: errors.array(),
        });
      }

      const user = await User.findById(req.params.userId);

      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan." });
      }

      user.kyc = {
        ...user.kyc,
        status: req.body.status,
        notes: req.body.notes || user.kyc?.notes || "",
        faceVerificationStatus:
          req.body.status === "approved"
            ? "verified"
            : user.kyc?.faceVerificationStatus || "pending_review",
        reviewedAt: new Date(),
        reviewedBy: req.user.fullName,
      };

      await user.save();

      return res.json({
        message: "Status KYC berhasil diperbarui.",
        user: sanitizeUser(user),
      });
    } catch (error) {
      next(error);
    }
  },
);

adminRouter.get("/transfers", async (req, res, next) => {
  try {
    const status = String(req.query.status || "").trim();
    const keyword = String(req.query.keyword || "").trim();

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (keyword) {
      filter.$or = [
        { reference: { $regex: keyword, $options: "i" } },
        { recipientName: { $regex: keyword, $options: "i" } },
        { senderName: { $regex: keyword, $options: "i" } },
      ];
    }

    const transfers = await Transfer.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ transfers });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch(
  "/transfers/:transferId/status",
  [
    body("status")
      .isIn([
        "pending_payment",
        "processing",
        "paid",
        "completed",
        "cancelled",
      ])
      .withMessage("Status transfer tidak valid."),
    body("statusNotes").optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validasi status transfer gagal.",
          errors: errors.array(),
        });
      }

      const transfer = await Transfer.findById(req.params.transferId);

      if (!transfer) {
        return res.status(404).json({ message: "Transfer tidak ditemukan." });
      }

      if (
        ["processing", "paid", "completed"].includes(req.body.status) &&
        !transfer.paymentProof?.path
      ) {
        return res.status(400).json({
          message:
            "Transfer belum memiliki bukti pembayaran. Minta user mengunggah bukti terlebih dahulu.",
        });
      }

      transfer.status = req.body.status;
      transfer.statusNotes = req.body.statusNotes || transfer.statusNotes || "";
      transfer.updatedBy = req.user.fullName;

      if (
        transfer.paymentProof?.path &&
        ["processing", "paid", "completed"].includes(req.body.status)
      ) {
        transfer.paymentProof.reviewedAt = new Date();
        transfer.paymentProof.reviewedBy = req.user.fullName;
      }

      await transfer.save();

      return res.json({
        message: "Status transfer berhasil diperbarui.",
        transfer,
      });
    } catch (error) {
      next(error);
    }
  },
);
