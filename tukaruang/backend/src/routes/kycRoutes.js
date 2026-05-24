import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "../middleware/auth.js";
import { ensureUploadDir, uploadDir } from "../utils/uploadDir.js";

ensureUploadDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
    cb(null, `${uuidv4()}-${safeName}`);
  },
});

const upload = multer({ storage });
export const kycRouter = express.Router();

kycRouter.get("/status", requireAuth, async (req, res) => {
  res.json({
    kyc: req.user.kyc,
    profile: req.user.profile,
    fullName: req.user.fullName,
    phone: req.user.phone,
    email: req.user.email,
  });
});

kycRouter.post(
  "/submit",
  requireAuth,
  upload.fields([
    { name: "identityDocument", maxCount: 1 },
    { name: "supportingDocument", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const { files = {}, body } = req;
      const identityFile = files.identityDocument?.[0];
      const supportingFile = files.supportingDocument?.[0];

      const documents = [
        identityFile && {
          label: "identityDocument",
          path: `/uploads/${identityFile.filename}`,
          originalName: identityFile.originalname,
          mimeType: identityFile.mimetype,
        },
        supportingFile && {
          label: "supportingDocument",
          path: `/uploads/${supportingFile.filename}`,
          originalName: supportingFile.originalname,
          mimeType: supportingFile.mimetype,
        },
      ].filter(Boolean);
      const selfieValue = body.selfieDataUrl || req.user.kyc?.selfieDataUrl || "";

      req.user.fullName = body.fullName || req.user.fullName;
      req.user.phone = body.phone || req.user.phone;
      req.user.profile = {
        ...req.user.profile,
        dateOfBirth: body.dateOfBirth || "",
        nationality: body.nationality || "",
        address: body.address || "",
        city: body.city || "",
        country: body.country || "",
        occupation: body.occupation || "",
        identityType: body.identityType || "",
        identityNumber: body.identityNumber || "",
        npwp: body.npwp || "",
        emergencyContactName: body.emergencyContactName || "",
        emergencyContactPhone: body.emergencyContactPhone || "",
      };

      req.user.kyc = {
        ...req.user.kyc,
        status: "pending_review",
        notes: body.notes || "",
        selfieDataUrl: selfieValue,
        faceVerificationStatus: selfieValue ? "pending_review" : "not_started",
        livenessConsent: body.livenessConsent === "true",
        submittedAt: new Date(),
        documents: documents.length ? documents : req.user.kyc?.documents || [],
      };

      await req.user.save();

      res.json({
        message: "Data KYC berhasil dikirim dan menunggu review.",
        kyc: req.user.kyc,
        profile: req.user.profile,
      });
    } catch (error) {
      next(error);
    }
  },
);
