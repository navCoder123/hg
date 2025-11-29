import dotenv from 'dotenv'
dotenv.config()
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodeMailer.js";

/* -------------------------------------------------------------------------- */
/*                                TOKEN HELPERS                               */
/* -------------------------------------------------------------------------- */

// Access Token – short-lived & minimal
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

// Refresh Token – long-lived
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

// Store refresh token in httpOnly cookie
const setRefreshCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProd ? true : false,                        // true only in production
    sameSite: isProd ? "none" : "lax",     // none only on HTTPS
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};


/* -------------------------------------------------------------------------- */
/*                                   REGISTER                                 */
/* -------------------------------------------------------------------------- */

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.json({ success: false, message: "Missing details" });

  try {
    const exists = await userModel.findOne({ email });
    if (exists)
      return res.json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const hashed = await bcrypt.hash(refreshToken, 10);
    user.refreshToken = hashed;
    await user.save();

    setRefreshCookie(res, refreshToken);

    return res.json({
      success: true,
      message: "Registered successfully",
      accessToken,
      userId: user._id,
      name: user.name,
      userEmail: user.email,
    });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

/* -------------------------------------------------------------------------- */
/*                                     LOGIN                                  */
/* -------------------------------------------------------------------------- */

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.json({ success: false, message: "Missing details" });

  try {
    const user = await userModel.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.json({ success: false, message: "Invalid email or password" });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const hashed = await bcrypt.hash(refreshToken, 10);
    user.refreshToken = hashed;
    await user.save();

    setRefreshCookie(res, refreshToken);

    return res.json({
      success: true,
      message: "Login successful",
      accessToken,
      userId: user._id,
      name: user.name,
      userEmail: user.email,
    });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

/* -------------------------------------------------------------------------- */
/*                              REFRESH TOKEN                                 */
/* -------------------------------------------------------------------------- */

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token)
      return res.json({ success: false, message: "NO_REFRESH_TOKEN" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_SECRET);
    } catch {
      return res.json({ success: false, message: "INVALID_REFRESH_TOKEN" });
    }

    const user = await userModel.findById(decoded.id);
    if (!user)
      return res.json({ success: false, message: "User not found" });

    const valid = await bcrypt.compare(token, user.refreshToken);
    if (!valid)
      return res.json({ success: false, message: "INVALID_REFRESH_TOKEN" });

    // ROTATE refresh token
    const newRefresh = generateRefreshToken(user._id);
    user.refreshToken = await bcrypt.hash(newRefresh, 10);
    await user.save();

    setRefreshCookie(res, newRefresh);

    // New access token
    const newAccess = generateAccessToken(user._id);

    return res.json({
      success: true,
      accessToken: newAccess,
    });
  } catch {
    return res.json({ success: false, message: "INVALID_REFRESH_TOKEN" });
  }
};

/* -------------------------------------------------------------------------- */
/*                                    LOGOUT                                  */
/* -------------------------------------------------------------------------- */

export const logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
    });

    return res.json({ success: true, message: "Logged out" });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

/* -------------------------------------------------------------------------- */
/*                                 IS AUTHENTICATED                            */
/* -------------------------------------------------------------------------- */

export const isAuthenticated = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.json({ success: false, message: "No token" });

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return res.json({ success: true, userId: decoded.id });
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.json({
          success: false,
          message: "ACCESS_TOKEN_EXPIRED",
        });
      }
      return res.json({ success: false, message: "Invalid token" });
    }
  } catch (err) {
    return res.json({ success: false, message: "Invalid token" });
  }
};


//send verify otp
export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });
    if (user.isAccountVerified) return res.json({ success: false, message: "Account already verified" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyOtp = otp;
    user.verifyOtpExpiryAt = Date.now() + 5 * 60 * 1000; // 5 min
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP is: ${otp}`,
    });

    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// verify email
export const verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.verifyOtp !== otp) return res.json({ success: false, message: "Invalid OTP" });
    if (user.verifyOtpExpiryAt < Date.now()) return res.json({ success: false, message: "OTP expired" });

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiryAt = 0;
    await user.save();

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//send reset otp
export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 5 * 60 * 1000; // 5 min
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Reset Password OTP",
      text: `Your reset OTP is: ${otp}`,
    });

    return res.json({ success: true, message: "Reset OTP sent to email" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//reset password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.resetOtp !== otp) return res.json({ success: false, message: "Invalid OTP" });
    if (user.resetOtpExpireAt < Date.now()) return res.json({ success: false, message: "OTP expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
