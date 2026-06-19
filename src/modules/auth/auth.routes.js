const express = require("express");

const {
  register,
  login,
  getMe,
  getUsersHandler,
  updateProfile,
  updateUser,
  deleteUser,
} = require("./auth.controller");

const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

router.post("/login", login);

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

router.get("/me", authMiddleware, getMe);
router.put("/profile", authMiddleware, updateProfile);

/*
|--------------------------------------------------------------------------
| ADMIN ONLY ROUTES
|--------------------------------------------------------------------------
*/

router.post("/register", authMiddleware, roleMiddleware("ADMIN"), register);
router.get("/users", authMiddleware, roleMiddleware("ADMIN"), getUsersHandler);
router.put("/users/:id", authMiddleware, roleMiddleware("ADMIN"), updateUser);
router.delete("/users/:id", authMiddleware, roleMiddleware("ADMIN"), deleteUser);

module.exports = router;
