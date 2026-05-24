import mongoose from "mongoose";

const paymentProofSchema = new mongoose.Schema(
  {
    path: { type: String, default: "" },
    originalName: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    submittedAt: Date,
    reviewedAt: Date,
    reviewedBy: { type: String, default: "" },
  },
  { _id: false },
);

const transferSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reference: { type: String, required: true, unique: true },
    senderName: { type: String, required: true },
    recipientName: { type: String, required: true },
    recipientPhone: { type: String, default: "" },
    recipientCountry: { type: String, required: true },
    recipientBank: { type: String, default: "" },
    recipientAccountNumber: { type: String, default: "" },
    payoutMethod: {
      type: String,
      enum: ["bank_transfer", "cash_pickup", "mobile_wallet"],
      default: "bank_transfer",
    },
    purpose: { type: String, default: "" },
    fromCurrency: { type: String, required: true, uppercase: true },
    toCurrency: { type: String, required: true, uppercase: true },
    amount: { type: Number, required: true },
    marketRate: { type: Number, required: true },
    displayRate: { type: Number, required: true },
    adminFee: { type: Number, required: true },
    serviceFee: { type: Number, required: true },
    receiveAmount: { type: Number, required: true },
    profitEstimate: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "draft",
        "pending_payment",
        "processing",
        "paid",
        "completed",
        "cancelled",
      ],
      default: "pending_payment",
    },
    statusNotes: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
    paymentProof: { type: paymentProofSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export const Transfer = mongoose.model("Transfer", transferSchema);
