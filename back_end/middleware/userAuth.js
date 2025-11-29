import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No access token provided
    if (!authHeader) {
      return res.json({
        success: false,
        message: "No token",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify access token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // Token expired — frontend will auto-refresh it
        if (err.name === "TokenExpiredError") {
          return res.json({
            success: false,
            message: "ACCESS_TOKEN_EXPIRED",
          });
        }

        // Other JWT errors
        return res.json({
          success: false,
          message: "Invalid token",
        });
      }

      // Token valid — attach user id to request
      req.userId = decoded.id;
      next();
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Auth failed",
    });
  }
};

export default userAuth;
