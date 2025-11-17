// backend/routes/eventRoutes.js
import express from "express";
import multer from "multer";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
} from "../controller/eventController.js";

const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Upload route
router.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");
    res.json({ success: true, imageUrl: `/uploads/${req.file.filename}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// CRUD routes
router.get("/", getEvents);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;
