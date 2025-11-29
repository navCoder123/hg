import express from "express";
import userAuth from "../middleware/userAuth.js";
import Order from "../models/orderModel.js";

const router = express.Router();

router.post("/save-order", userAuth, async (req, res) => {
  try {
    const { paymentId, amount, eventId } = req.body;

    if (!amount) return res.status(400).json({ success: false, message: "Amount is required" });

    const newOrder = new Order({
      user: req.userId || null,      // null for guest
      paymentId: paymentId || null,
      amount,
      eventId: eventId || null,
      status: paymentId ? "paid" : "created", // paid if paymentId exists
    });

    await newOrder.save();
    res.json({ success: true, message: "Order saved successfully", order: newOrder });
  } catch (error) {
    console.error("Save order error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/my-orders", userAuth, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

    const orders = await Order.find({ user: userId })
      .populate("eventId")  // populate event details
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
