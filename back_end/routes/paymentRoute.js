// routes/paymentRoute.js
import express from "express";
import bodyParser from "body-parser";
import { getKey, createOrder, razorpayWebhook, getQR, savePayment } from "../controller/paymentController.js";
import Payment from "../models/paymentModel.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.post(
  "/razorpay-webhook",
  bodyParser.raw({ type: "application/json" }),
  razorpayWebhook
);

router.post("/get-qr", getQR);
router.get("/razorpay-key", getKey);
router.post("/create-order", createOrder);
router.post("/save", savePayment);
router.get("/:id", async (req, res) => {
  try {
    const payment = await Payment.findOne({ paymentId: req.params.id });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const formatted = {
      paymentId: payment.paymentId,
      orderId: payment.orderId,
      amount: payment.amount,
      qrDataUrl: payment.qrDataUrl,
    };

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
