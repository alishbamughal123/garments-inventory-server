const {
  registerUser,
  loginUser,
} = require("./auth.service");

const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHandler");

const {
  registerSchema,
  loginSchema,
} = require("./auth.validation");

const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const result = await registerUser(validatedData);

    return successResponse(
      res,
      result,
      "User registered successfully"
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const result = await loginUser(validatedData);

    return successResponse(
      res,
      result,
      "Login successful"
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
const getMe = async (req, res) => {
  try {
    const { passwordHash, ...safeUser } = req.user;

    return successResponse(
      res,
      safeUser,
      "Current user fetched successfully"
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  register,
  login,
  getMe,
};