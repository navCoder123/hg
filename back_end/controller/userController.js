import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

    const user = await userModel.findById(userId).select("-password -refreshToken");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.json({ success: true, userData: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
