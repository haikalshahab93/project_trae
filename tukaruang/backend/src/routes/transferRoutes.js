import express from "express";
import { body, validationResult } from "express-validator";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "../middleware/auth.js";
import { Transfer } from "../models/Transfer.js";
import { buildQuote } from "../services/exchangeRateService.js";
import { ensureUploadDir, uploadDir } from "../utils/uploadDir.js";

export const transferRouter = express.Router();

ensureUploadDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
    cb(null, `${uuidv4()}-${safeName}`);
  },
});

const upload = multer({ storage });

transferRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const transfers = await Transfer.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
    res.json({ transfers });
  } catch (error) {
    next(error);
  }
});

transferRouter.post(
  "/",
  requireAuth,
  [
    body("fromCurrency").trim().isLength({ min: 3, max: 3 }),
    body("toCurrency").trim().isLength({ min: 3, max: 3 }),
    body("amount")
      .isFloat({ gt: 0 })
      .withMessage("Jumlah transfer harus lebih besar dari 0."),
    body("recipientName")
      .trim()
      .notEmpty()
      .withMessage("Nama penerima wajib diisi."),
    body("recipientPhone").optional({ values: "falsy" }).isString(),
    body("recipientCountry")
      .trim()
      .notEmpty()
      .withMessage("Negara tujuan wajib diisi."),
    body("recipientBank").optional({ values: "falsy" }).isString(),
    body("recipientAccountNumber").optional({ values: "falsy" }).isString(),
    body("payoutMethod")
      .isIn(["bank_transfer", "cash_pickup", "mobile_wallet"])
      .withMessage("Metode payout tidak valid."),
    body("purpose").optional({ values: "falsy" }).isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validasi transfer gagal.",
          errors: errors.array(),
        });
      }

      if (req.user.kyc?.status !== "approved") {
        return res.status(403).json({
          message:
            "Transfer hanya bisa dibuat setelah KYC disetujui. Silakan lengkapi dan tunggu approval tim compliance.",
        });
      }

      const {
        fromCurrency,
        toCurrency,
        amount,
        recipientName,
        recipientPhone,
        recipientCountry,
        recipientBank,
        recipientAccountNumber,
        payoutMethod,
        purpose,
      } = req.body;

      const normalizedFromCurrency = String(fromCurrency || "QAR").toUpperCase();
      const normalizedToCurrency = String(toCurrency || "IDR").toUpperCase();
      const normalizedAmount = Number(amount);

      const quote = await buildQuote({
        amount: normalizedAmount,
        fromCurrency: normalizedFromCurrency,
        toCurrency: normalizedToCurrency,
      });

      const transfer = await Transfer.create({
        user: req.user._id,
        reference: `TRX-${uuidv4().slice(0, 8).toUpperCase()}`,
        senderName: req.user.fullName,
        recipientName: String(recipientName).trim(),
        recipientPhone: recipientPhone || "",
        recipientCountry: String(recipientCountry).trim(),
        recipientBank: recipientBank || "",
        recipientAccountNumber: recipientAccountNumber || "",
        payoutMethod,
        purpose: purpose || "",
        fromCurrency: normalizedFromCurrency,
        toCurrency: normalizedToCurrency,
        amount: normalizedAmount,
        marketRate: quote.marketRate,
        displayRate: quote.displayRate,
        adminFee: quote.adminFee,
        serviceFee: quote.adminFee,
        receiveAmount: quote.receiveAmount,
        profitEstimate: quote.profitEstimate,
        status: "pending_payment",
      });

      return res.status(201).json({
        message: "Transfer berhasil dibuat dan menunggu pembayaran.",
        transfer,
      });
    } catch (error) {
      next(error);
    }
  },
);

transferRouter.post(
  "/:transferId/payment-proof",
  requireAuth,
  upload.single("paymentProof"),
  async (req, res, next) => {
    try {
      const transfer = await Transfer.findOne({
        _id: req.params.transferId,
        user: req.user._id,
      });

      if (!transfer) {
        return res.status(404).json({ message: "Transfer tidak ditemukan." });
      }

      if (transfer.status !== "pending_payment") {
        return res.status(400).json({
          message:
            "Bukti pembayaran hanya bisa diunggah saat transfer masih menunggu pembayaran.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "File bukti pembayaran wajib diunggah.",
        });
      }

      transfer.paymentProof = {
        path: `/uploads/${req.file.filename}`,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        submittedAt: new Date(),
        reviewedAt: undefined,
        reviewedBy: "",
      };
      transfer.updatedBy = req.user.fullName;
      await transfer.save();

      return res.json({
        message: "Bukti pembayaran berhasil diunggah.",
        transfer,
      });
    } catch (error) {
      next(error);
    }
  },
);
