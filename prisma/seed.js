const prisma = require("../src/config/db");
const bcrypt = require("bcryptjs");

async function ensureDefaultAdmin() {
  try {
    const existingAdmin = await prisma.user.findFirst();
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash("admin123", 10);
      const admin = await prisma.user.create({
        data: {
          name: "Admin User",
          email: "admin@example.com",
          passwordHash,
          role: "ADMIN",
          isActive: true,
        },
      });
      console.log("SUCCESS: Default admin created with email:", admin.email);
    } else {
      console.log("SUCCESS: Existing user found:", existingAdmin.email);
    }
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
