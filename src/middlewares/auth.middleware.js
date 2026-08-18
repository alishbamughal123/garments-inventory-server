const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "super_secret_jwt_key";
    const decoded = jwt.verify(token, secret);

    // Try finding in User model first
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (user) {
      req.user = user;
      return next();
    }

    // Try finding in Customer model (for B2B portal login)
    const customer = await prisma.customer.findUnique({
      where: { id: decoded.id },
    });

    if (customer) {
      req.user = {
        id: customer.id,
        name: customer.fullName,
        email: customer.email,
        role: "CUSTOMER",
        companyName: customer.companyName,
        customerCode: customer.customerCode
      };
      return next();
    }

    return res.status(401).json({
      success: false,
      message: "User account not found",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;