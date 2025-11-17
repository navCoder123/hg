import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // 🧑‍💼 User (optional — null for guest checkout)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // 💳 Razorpay payment ID (added later after successful payment)
    paymentId: {
      type: String,
      required: false,
      index: true, // fast lookups
    },

    // 💰 Payment amount in INR
    amount: {
      type: Number,
      required: true,
    },

    // 🎟️ Optional event association (if payment is for an event)
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: false,
    },

    // 📦 Order status (created, paid, failed, refunded, etc.)
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },
  },
  { timestamps: true }
);

// 📌 Indexes for faster queries
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
