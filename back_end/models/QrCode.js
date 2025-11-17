import mongoose from "mongoose";

const qrSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  scannedBy: { type: String, default: "unknown" },
  data: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("QrCode", qrSchema);
