import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    path: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["customer", "admin", "compliance"],
      default: "customer",
    },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    profile: {
      dateOfBirth: String,
      nationality: String,
      address: String,
      city: String,
      country: String,
      occupation: String,
      identityType: String,
      identityNumber: String,
      npwp: String,
      emergencyContactName: String,
      emergencyContactPhone: String,
    },
    kyc: {
      status: {
        type: String,
        enum: ["not_submitted", "pending_review", "approved", "rejected"],
        default: "not_submitted",
      },
      notes: { type: String, default: "" },
      selfieDataUrl: { type: String, default: "" },
      faceVerificationStatus: {
        type: String,
        enum: ["not_started", "captured", "pending_review", "verified"],
        default: "not_started",
      },
      livenessConsent: { type: Boolean, default: false },
      submittedAt: Date,
      reviewedAt: Date,
      reviewedBy: { type: String, default: "" },
      documents: [documentSchema],
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);
