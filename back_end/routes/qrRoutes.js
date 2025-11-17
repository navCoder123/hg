import express from "express";
import QrCode from "../models/QrCode.js";

const router = express.Router();

// Save scanned QR
router.post("/scan", async (req, res) => {
  try {
    const { eventId, scannedBy, data } = req.body;
    const qr = await QrCode.create({ eventId, scannedBy, data });
    res.json({ success: true, qr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to save QR" });
  }
});

// Get scanned QRs for an event
router.get("/:eventId", async (req, res) => {
  try {
    const qrList = await QrCode.find({ eventId: req.params.eventId });
    res.json({ success: true, qrList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch QR codes" });
  }
});

export default router;
