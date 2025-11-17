// routes/orderRoutes.js
import express from "express";
import userAuth from "../middleware/userAuth.js";
import Order from "../models/orderModel.js";

const router = express.Router();

// Save order
router.post("/save-order", userAuth, async (req, res) => {
  try {
    const { paymentId, amount, eventId } = req.body;

    // Validate required fields
    if (!paymentId) return res.status(400).json({ success: false, message: "paymentId is required" });
    if (!req.userId) return res.status(400).json({ success: false, message: "User is required" });

    const newOrder = new Order({
      user: '68fe141feefc477be358b166',       // mandatory field in model
      paymentId,              // mandatory field in model
      amount,
      eventId: eventId || null,
      status: "success",
    });

    await newOrder.save();
    res.json({ success: true, message: "Order saved successfully", order: newOrder });
  } catch (error) {
    console.error("Save order error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
