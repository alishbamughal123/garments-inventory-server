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

    // Ensure default B2B Portal Customer
    const customerPasswordHash = await bcrypt.hash("customer123", 10);
    const customer = await prisma.customer.upsert({
      where: { email: "customer@example.com" },
      update: {
        passwordHash: customerPasswordHash,
        isPortalActive: true,
        status: "ACTIVE",
      },
      create: {
        customerCode: "CUST-DEFAULT-0001",
        fullName: "Test B2B Customer",
        companyName: "Nordic Test Client AS",
        email: "customer@example.com",
        phoneNumber: "+4712345678",
        passwordHash: customerPasswordHash,
        isPortalActive: true,
        status: "ACTIVE",
      },
    });
    console.log("SUCCESS: Default B2B customer ensured:", customer.email);
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
