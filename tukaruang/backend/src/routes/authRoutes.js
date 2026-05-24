import express from "express";
import { body, validationResult } from "express-validator";
import { User } from "../models/User.js";
import { generateToken, sanitizeUser } from "../services/authService.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = express.Router();

authRouter.post(
  "/register",
  [
    body("fullName").trim().notEmpty().withMessage("Nama lengkap wajib diisi."),
    body("email").isEmail().withMessage("Email tidak valid."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password minimal 6 karakter."),
    body("phone").optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validasi gagal.", errors: errors.array() });
      }

      const { fullName, email, password, phone } = req.body;
      const existing = await User.findOne({ email: email.toLowerCase() });

      if (existing) {
        return res.status(409).json({ message: "Email sudah terdaftar." });
      }

      const user = await User.create({
        fullName,
        email,
        password,
        phone,
      });

      const token = generateToken(user);
      res.status(201).json({ token, user: sanitizeUser(user) });
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email tidak valid."),
    body("password").notEmpty().withMessage("Password wajib diisi."),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validasi gagal.", errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: "Email atau password salah." });
      }

      const token = generateToken(user);
      res.json({ token, user: sanitizeUser(user) });
    } catch (error) {
      next(error);
    }
  },
);

authRouter.get("/me", requireAuth, async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});
