import Razorpay from "razorpay";
import dotenv from "dotenv";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import Payment from "../models/paymentModel.js";
import Order from "../models/orderModel.js";

dotenv.config();

// ✅ Get Razorpay Key
export const getKey = (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID)
    return res.status(500).json({ message: "Razorpay key missing" });
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
};

// ✅ Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    const { amount, name, email } = req.body;
    const userId = req.userId || null; // userId from JWT if logged in

    console.log("CREATE ORDER BODY:", req.body, "userId:", userId);

    if (!amount || isNaN(amount) || amount <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const order = await instance.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      notes: { userId, name: name || "Guest", email: email || "guest@example.com" },
    });

    // ✅ Save the Razorpay order in DB (no payment yet)
    const newOrder = new Order({
      user: userId || null,
      amount,
      status: "created",
    });

    await newOrder.save();

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Webhook for Razorpay Payment Capture
export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_SECRET;
    const body = req.body.toString();

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature)
      return res.status(400).send("Invalid signature");

    const payload = JSON.parse(body);

    if (payload.event === "payment.captured") {
      const paymentEntity = payload.payload.payment.entity;
      const { id, amount, currency, email, notes } = paymentEntity;

      const userId = notes?.userId !== "guest" ? notes?.userId : null;
      const customerName = notes?.name || "Guest";
      const customerEmail = email || notes?.email || "guest@example.com";

      // ✅ Generate QR Folder
      const qrFolder = path.join(process.cwd(), "qrcodes");
      if (!fs.existsSync(qrFolder)) fs.mkdirSync(qrFolder, { recursive: true });

      const qrFileName = `${id}.png`;
      const qrFilePath = path.join(qrFolder, qrFileName);

      // ✅ Create QR Code
      await QRCode.toFile(
        qrFilePath,
        `Payment Successful!\nPayment ID: ${id}\nAmount: ₹${amount / 100} ${currency}\nName: ${customerName}\nEmail: ${customerEmail}`
      );

      const qrDataUrl = `${req.protocol}://${req.get("host")}/qrcodes/${qrFileName}`;

      // ✅ Save Payment Info
      const newPayment = new Payment({
        paymentId: id,
        orderId: id,
        userId,
        amount: amount / 100,
        currency,
        name: customerName,
        email: customerEmail,
        qrDataUrl,
        status: "success",
      });

      await newPayment.save();

      // ✅ Update related order (add paymentId + mark as paid)
      await Order.findOneAndUpdate(
        { user: userId },
        { paymentId: id, status: "paid" }
      );

      console.log("✅ Payment saved & order updated:", id);

      res.status(200).json({ message: "Payment saved & QR generated", qrDataUrl });
    } else {
      res.status(200).send("Event ignored");
    }
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    res.status(500).send("Webhook handling failed");
  }
};

// ✅ Save Payment (Manual Fallback)
export const savePayment = async (req, res) => {
  try {
    const { paymentId, orderId, amount, name, email, qrDataUrl } = req.body;
    const userId = req.userId || null;

    if (!paymentId || !orderId || !amount)
      return res.status(400).json({ message: "Missing fields" });

    const newPayment = new Payment({
      paymentId,
      orderId,
      amount,
      name: name || "Guest",
      email: email || "guest@example.com",
      qrDataUrl,
      userId,
      status: "success",
    });

    await newPayment.save();

    // Update order record as well
    await Order.findOneAndUpdate(
      { user: userId },
      { paymentId, status: "paid" }
    );

    res.json({ success: true, message: "Payment saved successfully" });
  } catch (err) {
    console.error("SAVE PAYMENT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get Payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findOne({ paymentId: id });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    res.json({ payment });
  } catch (err) {
    console.error("GET PAYMENT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get QR Code by Payment ID
export const getQR = (req, res) => {
  const { paymentId } = req.body;
  if (!paymentId) return res.status(400).json({ message: "Payment ID required" });

  const qrFilePath = path.join(process.cwd(), "qrcodes", `${paymentId}.png`);
  if (!fs.existsSync(qrFilePath))
    return res.status(404).json({ message: "QR code not ready yet" });

  const qrDataUrl = `${req.protocol}://${req.get("host")}/qrcodes/${paymentId}.png`;
  res.status(200).json({ qrDataUrl });
};

export default {
  getKey,
  createOrder,
  razorpayWebhook,
  savePayment,
  getPaymentById,
  getQR,
};
