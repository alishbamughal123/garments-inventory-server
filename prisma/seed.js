const prisma = require("../src/config/db");
const bcrypt = require("bcryptjs");

async function ensureDefaultAdmin() {
  try {
    const passwordHash = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {
        passwordHash,
        isActive: true,
        role: "ADMIN",
      },
      create: {
        name: "Admin User",
        email: "admin@example.com",
        passwordHash,
        role: "ADMIN",
        isActive: true,
      },
    });
    console.log("SUCCESS: Default admin ensured:", admin.email);
  } catch (error) {
    console.error("SEED WARNING:", error.message);
  }
}

if (require.main === module) {
  ensureDefaultAdmin()
    .catch((e) => {
      console.error("SEED ERROR:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = ensureDefaultAdmin;
