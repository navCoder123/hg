// routes/paymentRoute.js
import express from "express";
import { 
  getKey, 
  createOrder, 
  getQR, 
  savePayment 
} from "../controller/paymentController.js";

import Payment from "../models/paymentModel.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

/* ============================================
   1️⃣ REMOVE WEBHOOK FROM HERE  
   Webhook MUST be handled only in server.js
============================================ */
// ❌ DO NOT PUT WEBHOOK HERE
// router.post("/razorpay-webhook", razorpayWebhook);

/* ============================================
   2️⃣ GET RAZORPAY KEY (public)
============================================ */
router.get("/razorpay-key", getKey);

/* ============================================
   3️⃣ CREATE ORDER (authenticated)
============================================ */
router.post("/create-order", userAuth, createOrder);

/* ============================================
   4️⃣ SAVE PAYMENT (manual fallback)
============================================ */
router.post("/save", userAuth, savePayment);

/* ============================================
   5️⃣ GET QR FOR PAYMENT (authenticated)
============================================ */
router.post("/get-qr", userAuth, getQR);

/* ============================================
   6️⃣ Get Payment by paymentId 
============================================ */
router.get("/:id", async (req, res) => {
  try {
    const payment = await Payment.findOne({ paymentId: req.params.id });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ payment });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


export default router;
