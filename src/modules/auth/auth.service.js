const bcrypt = require("bcryptjs");

const prisma = require("../../config/db");

const generateToken = require("../../utils/generateToken");

/*
|--------------------------------------------------------------------------
| REGISTER USER
|--------------------------------------------------------------------------
*/

const registerUser = async (payload) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await prisma.user.create({
    data: {
      name: payload.name,

      email: payload.email,

      passwordHash: hashedPassword,

      role: payload.role || "STAFF",
    },
  });

  const token = generateToken(user);

  // REMOVE PASSWORD
  const { passwordHash, ...safeUser } = user;

  return {
    token,
    user: safeUser,
  };
};

/*
|--------------------------------------------------------------------------
| LOGIN USER
|--------------------------------------------------------------------------
*/

const loginUser = async (payload) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.passwordHash
  );

  if (!isPasswordMatched) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user);

  // REMOVE PASSWORD
  const { passwordHash, ...safeUser } = user;

  return {
    token,
    user: safeUser,
  };
};

module.exports = {
  registerUser,
  loginUser,
};