import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    isLoggedIn: { type: Boolean, default: false },
    isAccountVerified: { type: Boolean, default: false },
    verifyOtp: { type: String, default: "" },
    verifyOtpExpiryAt: { type: Number, default: 0 },
    resetOtp: { type: String, default: "" },
    resetOtpExpireAt: { type: Number, default: 0 },
    authType: { type: String, default: "local" },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
