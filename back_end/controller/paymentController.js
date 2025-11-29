import Razorpay from "razorpay";
import dotenv from "dotenv";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import Payment from "../models/paymentModel.js";
import Order from "../models/orderModel.js";
import mongoose from "mongoose";

dotenv.config();

/* ============================================================
   GET RAZORPAY KEY
============================================================ */
export const getKey = (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID) {
    return res.status(500).json({ message: "Razorpay key missing" });
  }
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
};

/* ============================================================
   CREATE ORDER (Authenticated)
============================================================ */
// controller: createOrder
export const createOrder = async (req, res) => {
  try {
    const { amount, name, email, eventId } = req.body;
    const userId = req.userId || null;

    console.log("CREATE ORDER:", { amount, name, email, userId, eventId });

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), // paise
      currency: "INR",
      notes: {
        userId: userId ? String(userId) : "null",
        name: name || "Guest",
        email: email || "guest@example.com",
        eventId: eventId || "null",
      },
    });

    console.log("RAZORPAY ORDER CREATED:", order.id);

    // Save in DB and include razorpayOrderId and eventId
    const newOrder = new Order({
      user: userId || null,
      event: eventId || null,
      amount: Number(amount),
      razorpayOrderId: order.id,    // <--- IMPORTANT
      status: "created",
      createdAt: Date.now(),
    });

    await newOrder.save();

    // Return order data that frontend expects
    return res.status(200).json({
      success: true,
      order,
      dbOrderId: newOrder._id,
    });

  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    // be helpful in logs, but keep API response generic
    return res.status(500).json({ success: false, message: "Order creation failed" });
  }
};


/* ============================================================
   RAZORPAY WEBHOOK (Payment Captured)
============================================================ */
let webhookSecret = "123456"
export const razorpayWebhook = async (req, res) => {
  try {
    console.log("🔥 WEBHOOK RECEIVED");

    const signature = req.headers["x-razorpay-signature"];
    const secret = webhookSecret;

    const rawBody = req.body; // RAW BUFFER from express.raw()

    // Validate signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    console.log("Header Signature:", signature);
    console.log("Expected Signature:", expectedSignature);

    if (signature !== expectedSignature) {
      console.log("❌ Invalid signature");
      return res.status(400).send("Invalid signature");
    }

    const payload = JSON.parse(rawBody.toString());

    if (payload.event !== "payment.captured") {
      return res.status(200).send("Ignored");
    }

    const p = payload.payload.payment.entity;

    console.log("🔥 WEBHOOK HIT: PAYMENT CAPTURED");
    console.log("NOTES:", p.notes);

    // Fix userId
    let userId = p.notes?.userId;
    if (!userId || userId === "null" || userId === "undefined") {
      userId = null;
    } else {
      try {
        userId = new mongoose.Types.ObjectId(userId);
      } catch {
        userId = null;
      }
    }

    const name = p.notes?.name || "Guest";
    const email = p.notes?.email || "guest@example.com";

    // Generate QR
    const qrDir = path.join(process.cwd(), "qrcodes");
    if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

    const qrFilename = `${p.id}.png`;
    const qrPath = path.join(qrDir, qrFilename);

    await QRCode.toFile(
      qrPath,
      `Payment Successful!\nPayment ID: ${p.id}\nAmount: ₹${p.amount / 100}\nName: ${name}\nEmail: ${email}`
    );

    const qrDataUrl = `${req.protocol}://${req.get("host")}/qrcodes/${qrFilename}`;

    // Save Payment
    await Payment.create({
      paymentId: p.id,
      orderId: p.order_id,
      userId,
      name,
      email,
      amount: p.amount / 100,
      currency: p.currency,
      qrDataUrl,
      status: "success",
    });

    console.log("✔ PAYMENT SAVED:", p.id);

    await Order.findOneAndUpdate(
      { razorpayOrderId: p.order_id },
      { paymentId: p.id, status: "paid" }
    );

    console.log("✔ ORDER UPDATED");

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("🔥 WEBHOOK ERROR:", error);
    return res.status(500).send("Webhook failed");
  }
};



/* ============================================================
   MANUAL PAYMENT SAVE (Not used generally)
============================================================ */
export const savePayment = async (req, res) => {
  try {
    const { paymentId, orderId, amount, name, email, qrDataUrl } = req.body;
    const userId = req.userId || null;

    await Payment.create({
      paymentId,
      orderId,
      amount,
      name,
      email,
      qrDataUrl,
      userId,
      status: "success",
    });

    await Order.findOneAndUpdate(
      { user: userId },
      { paymentId, status: "paid" }
    );

    res.json({ success: true });

  } catch (error) {
    console.error("MANUAL SAVE ERROR:", error);
    res.status(500).json({ message: "Manual save failed" });
  }
};

/* ============================================================
   GET PAYMENT BY ID
============================================================ */
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({ paymentId: req.params.id });

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    res.json({ payment });

  } catch (error) {
    console.error("GET PAYMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============================================================
   GET QR FOR PAYMENT
============================================================ */
export const getQR = (req, res) => {
  const { paymentId } = req.body;

  if (!paymentId) return res.status(400).json({ message: "Payment ID required" });

  const filePath = path.join(process.cwd(), "qrcodes", `${paymentId}.png`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "QR code not ready yet" });
  }

  const qrUrl = `${req.protocol}://${req.get("host")}/qrcodes/${paymentId}.png`;
  res.json({ qrDataUrl: qrUrl });
};

export default {
  getKey,
  createOrder,
  razorpayWebhook,
  savePayment,
  getPaymentById,
  getQR,
};
