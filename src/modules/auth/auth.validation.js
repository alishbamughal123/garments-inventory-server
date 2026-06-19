const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(3),

  email: z.string().email(),

  password: z.string().min(6),

  role: z.enum(["ADMIN", "MANAGER", "CASHIER", "STAFF"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),

  password: z.string().min(6),
});

const updateProfileSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().min(6).optional(),
  newPassword: z.string().min(6).optional(),
}).refine(data => {
  if (data.newPassword && !data.currentPassword) return false;
  return true;
}, {
  message: "Current password is required to set a new password",
  path: ["currentPassword"]
});

const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["ADMIN", "MANAGER", "CASHIER", "STAFF"]).optional(),
  isActive: z.boolean().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updateUserSchema,
};