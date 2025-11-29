import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import connectDB from "./config/mongodb.js";

// Routes
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import eventRouter from "./routes/eventroutes.js";
import qrRouter from "./routes/qrRoutes.js";
import orderRouter from "./routes/orderRoutes.js";

// Controller (Webhook)
import { razorpayWebhook } from "../back_end/controller/paymentController.js";

const app = express();
const port = process.env.PORT || 4000;

// Connect DB
connectDB();

// CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

/* ========================================================
   🔥 1️⃣ RAZORPAY WEBHOOK — MUST BE RAW & ABOVE JSON PARSER
======================================================== */
app.post(
  "/api/payment/razorpay-webhook",
  express.raw({ type: "application/json" }), // raw body needed for signature
  razorpayWebhook
);

/* ========================================================
   2️⃣ JSON PARSER (AFTER WEBHOOK)
======================================================== */
app.use(express.json());
app.use(cookieParser());

/* ========================================================
   3️⃣ ROUTES
======================================================== */
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/payment", paymentRouter); // normal payment routes
app.use("/api/events", eventRouter);
app.use("/api/qr", qrRouter);
app.use("/api/orders", orderRouter);

// Serve uploaded assets
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Serve QR code images
app.use("/qrcodes", express.static(path.join(process.cwd(), "qrcodes")));

app.get("/", (req, res) => res.send("API working..."));

/* ========================================================
   4️⃣ START SERVER
======================================================== */
app.listen(port, () =>
  console.log(`🚀 Server running on PORT ${port}`)
);

