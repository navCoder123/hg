import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import eventRouter from "./routes/eventroutes.js";
import qrRouter from "./routes/qrRoutes.js";
import orderRouter from "./routes/orderRoutes.js";

const app = express();
const port = process.env.PORT || process.env.PORT_A;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: [process.env.BATO, process.env.BATO_A, process.env.BATO_B, process.env.BATO_C],
    credentials: true   
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/events", eventRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/payment", paymentRouter);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/qr", qrRouter);
app.use('/api/orders',orderRouter)

// Serve QR codes statically
app.use('/qrcodes', express.static(path.join(process.cwd(), 'qrcodes')));

// Test route
app.get("/", (req, res) => res.send("API working..."));

// Optional: log requests for debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Start server
app.listen(port, () => console.log(`Server started on PORT: ${port}`));
