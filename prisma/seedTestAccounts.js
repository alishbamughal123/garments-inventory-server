const prisma = require("../src/config/db");
const bcrypt = require("bcryptjs");

async function seedTestAccounts() {
  console.log("Seeding test accounts and sample articles...");

  // 1. Create Admin User
  const adminPasswordHash = await bcrypt.hash("password123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@nordicprowear.com" },
    update: {
      passwordHash: adminPasswordHash,
      isActive: true,
      role: "ADMIN"
    },
    create: {
      name: "Admin Nordic",
      email: "admin@nordicprowear.com",
      phoneNumber: "+4711122333",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isActive: true
    }
  });
  console.log("✓ Admin Account created:", admin.email);

  // 2. Create B2B Portal Customer
  const customerPasswordHash = await bcrypt.hash("password123", 10);
  const customer = await prisma.customer.upsert({
    where: { phoneNumber: "+4798765432" },
    update: {
      email: "client@nordicretail.no",
      passwordHash: customerPasswordHash,
      isPortalActive: true,
      status: "ACTIVE"
    },
    create: {
      customerCode: "CUST-2026-0001",
      fullName: "Ola Nordmann",
      companyName: "Nordic Retail AS",
      vatNumber: "NO 987 654 321 MVA",
      designation: "Purchasing Manager",
      phoneNumber: "+4798765432",
      email: "client@nordicretail.no",
      passwordHash: customerPasswordHash,
      isPortalActive: true,
      address: "Storgata 100, 0182 Oslo",
      city: "Oslo",
      customerType: "WHOLESALE",
      status: "ACTIVE",
      contacts: {
        create: [
          {
            name: "Ola Nordmann",
            title: "Purchasing Director",
            email: "client@nordicretail.no",
            phone: "+4798765432",
            isPrimary: true
          },
          {
            name: "Kari Nordmann",
            title: "Billing Officer",
            email: "billing@nordicretail.no",
            phone: "+4798765433",
            isPrimary: false
          }
        ]
      }
    }
  });
  console.log("✓ B2B Customer Account created:", customer.email || customer.phoneNumber);

  // 3. Create Sample Category & Products with Weight
  const category = await prisma.category.upsert({
    where: { name: "Outerwear & Workwear" },
    update: {},
    create: {
      name: "Outerwear & Workwear",
      description: "Heavy duty Arctic jackets & trousers"
    }
  });

  const sampleProducts = [
    {
      sku: "NP-PARKA-001",
      productName: "Arctic Expedition Heavy Parka",
      styleNumber: "NP-PARKA-001-XL-BLUE",
      color: "Fjord Blue",
      size: "XL",
      weightInKg: 0.85,
      purchasePrice: 450.00,
      salePrice: 890.00,
      stockQuantity: 50,
      minStockAlert: 5,
      categoryId: category.id
    },
    {
      sku: "NP-JACKET-002",
      productName: "Nordic Softshell Waterproof Jacket",
      styleNumber: "NP-JACKET-002-L-BLK",
      color: "Matte Black",
      size: "L",
      weightInKg: 0.55,
      purchasePrice: 280.00,
      salePrice: 590.00,
      stockQuantity: 80,
      minStockAlert: 10,
      categoryId: category.id
    },
    {
      sku: "NP-TROUSER-003",
      productName: "Pro Workwear Reinforced Trouser",
      styleNumber: "NP-TROUSER-003-M-NVY",
      color: "Navy Blue",
      size: "M",
      weightInKg: 0.45,
      purchasePrice: 190.00,
      salePrice: 420.00,
      stockQuantity: 120,
      minStockAlert: 15,
      categoryId: category.id
    }
  ];

  for (const prodData of sampleProducts) {
    const prod = await prisma.product.upsert({
      where: { sku: prodData.sku },
      update: {
        stockQuantity: prodData.stockQuantity,
        weightInKg: prodData.weightInKg,
        salePrice: prodData.salePrice
      },
      create: prodData
    });

    // Create Barcode
    await prisma.barcode.upsert({
      where: { barcodeValue: prodData.sku },
      update: {},
      create: {
        barcodeValue: prodData.sku,
        barcodeType: "CODE128",
        barcodeSource: "GENERATED",
        isPrimary: true,
        productId: prod.id
      }
    });

    // Set Custom Price for B2B Client on Parka
    if (prodData.sku === "NP-PARKA-001") {
      await prisma.customerPrice.upsert({
        where: {
          customerId_productId: {
            customerId: customer.id,
            productId: prod.id
          }
        },
        update: { customPrice: 750.00 },
        create: {
          customerId: customer.id,
          productId: prod.id,
          customPrice: 750.00
        }
      });
      console.log(`✓ Set Special B2B Agreed Price (NOK 750) for ${customer.companyName} on ${prod.productName}`);
    }
  }

  console.log("\n==========================================");
  console.log("TEST CREDENTIALS READY FOR LOCALHOST:");
  console.log("------------------------------------------");
  console.log("1. STAFF / ADMIN LOGIN:");
  console.log("   Email: admin@nordicprowear.com");
  console.log("   Password: password123");
  console.log("------------------------------------------");
  console.log("2. B2B CUSTOMER PORTAL LOGIN:");
  console.log("   Email / Phone: client@nordicretail.no");
  console.log("   (or phone): +4798765432");
  console.log("   Password: password123");
  console.log("==========================================\n");
}

seedTestAccounts()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
