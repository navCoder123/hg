import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
  try {
    // Extract userId from body
    const { userId } = req.body; // Expecting { "userId": "..." }

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Find user by ID
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
        isLoggedIn: user.isLoggedIn,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
