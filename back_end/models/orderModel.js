import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    paymentId: {
      type: String,
      index: true,
    },

    razorpayOrderId: {
      type: String,
      required: false,
    },

    amount: {
      type: Number,
      required: true,
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },

    qrDataUrl: {
      type: String,
    },

    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ razorpayOrderId: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
