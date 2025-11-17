// backend/controller/qrController.js
import QrCode from "../models/QrCode.js";

export const saveScannedQr = async (req, res) => {
  try {
    const { eventId, scannedBy, data } = req.body;
    const qr = await QrCode.create({ eventId, scannedBy, data });
    res.json({ success: true, qr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to save QR" });
  }
};

export const getScannedQrs = async (req, res) => {
  try {
    const qrs = await QrCode.find().populate("eventId", "title date");
    res.json({ success: true, qrs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch QRs" });
  }
};
