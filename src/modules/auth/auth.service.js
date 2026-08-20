const bcrypt = require("bcryptjs");
const prisma = require("../../config/db");
const generateToken = require("../../utils/generateToken");
const {
  getPaginationParams,
  formatPaginationMeta,
} = require("../../utils/pagination.helper");

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

const getUsers = async (query = {}) => {
  const { page, limit, skip, take, isAll } = getPaginationParams(query, 25, 200);
  const search = (query.search || query.query || "").trim();

  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (query.role) {
    where.role = query.role;
  }

  const select = {
    id: true,
    name: true,
    email: true,
    phoneNumber: true,
    role: true,
    isActive: true,
    createdAt: true,
  };

  if (isAll) {
    const users = await prisma.user.findMany({
      where,
      select,
      orderBy: {
        name: "asc",
      },
    });

    return {
      users,
      pagination: formatPaginationMeta(users.length, 1, users.length || 1),
    };
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select,
      skip,
      take,
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return {
    users,
    pagination: formatPaginationMeta(total, page, limit),
  };
};

const updateProfile = async (userId, payload) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updateData = {};

  if (payload.name) updateData.name = payload.name;
  if (payload.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existingUser && existingUser.id !== userId) {
      throw new Error("Email already in use");
    }
    updateData.email = payload.email;
  }

  if (payload.newPassword) {
    const isPasswordMatched = await bcrypt.compare(
      payload.currentPassword,
      user.passwordHash
    );

    if (!isPasswordMatched) {
      throw new Error("Invalid current password");
    }

    updateData.passwordHash = await bcrypt.hash(payload.newPassword, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  const { passwordHash, ...safeUser } = updatedUser;
  return safeUser;
};

const updateUser = async (userId, payload) => {
  const updateData = {};

  if (payload.name) updateData.name = payload.name;
  if (payload.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existingUser && existingUser.id !== userId) {
      throw new Error("Email already in use");
    }
    updateData.email = payload.email;
  }

  if (payload.password) {
    updateData.passwordHash = await bcrypt.hash(payload.password, 10);
  }

  if (payload.role) updateData.role = payload.role;
  if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  const { passwordHash, ...safeUser } = updatedUser;
  return safeUser;
};

const deleteUser = async (userId) => {
  // Instead of hard delete, we could toggle isActive, 
  // but if the user wants hard delete:
  return prisma.user.delete({
    where: { id: userId },
  });
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  updateProfile,
  updateUser,
  deleteUser,
};
