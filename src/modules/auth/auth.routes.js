const express = require("express");

const {
  register,
  login,
  getMe,
  getUsersHandler,
} = require("./auth.controller");

const authMiddleware = require("../../middlewares/auth.middleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

router.post("/register", register);

router.post("/login", login);

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

router.get("/me", authMiddleware, getMe);
router.get("/users", authMiddleware, getUsersHandler);

module.exports = router;
