import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    paymentId: {
      type: String,
      required: false,
      index: true,
    },

    razorpayOrderId: {
      type: String,
      required: false,
      index: true,   // used by webhook to find the order
    },

    amount: {
      type: Number,
      required: true,
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: false,
    },

    qrDataUrl: {
      type: String,
      required: false,
    },

    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },
  },
  { timestamps: true }
);

// helpful indexes
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ razorpayOrderId: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
