import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );

export const sanitizeUser = (user) => ({
  id: user._id,
  role: user.role,
  email: user.email,
  fullName: user.fullName,
  phone: user.phone,
  profile: user.profile,
  kyc: user.kyc,
  createdAt: user.createdAt,
});
