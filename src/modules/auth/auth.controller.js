const {
  registerUser,
  loginUser,
  getUsers,
  updateProfile: updateProfileService,
  updateUser: updateUserService,
  deleteUser: deleteUserService,
} = require("./auth.service");

const {
  successResponse,
  errorResponse,
  handleControllerError,
} = require("../../utils/responseHandler");

const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updateUserSchema,
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
    console.error("Register Error:", error);
    return handleControllerError(res, error);
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
    console.error("Login Error:", error);
    return handleControllerError(res, error);
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

const getUsersHandler = async (req, res) => {
  try {
    const result = await getUsers();

    return successResponse(
      res,
      result,
      "Users fetched successfully"
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const result = await updateProfileService(req.user.id, validatedData);

    return successResponse(res, result, "Profile updated successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateUserSchema.parse(req.body);
    const result = await updateUserService(id, validatedData);

    return successResponse(res, result, "User updated successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return errorResponse(res, "You cannot delete yourself");
    }
    await deleteUserService(id);
    return successResponse(res, null, "User deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  register,
  login,
  getMe,
  getUsersHandler,
  updateProfile,
  updateUser,
  deleteUser,
};
