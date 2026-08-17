const prisma = require("../src/config/db");

const missingDefinitions = [
  {
    base: "10121",
    name: "Drammen",
    desc: "Sweat shirt",
    fabric: "80% Cotton / 20% Polyester Heavy Sweat 280 GSM",
    color: "Black",
    colorSuffix: "B",
  },
  {
    base: "10122",
    name: "Kalmar",
    desc: "Fleece",
    fabric: "100% Microfleece 240 GSM Anti-Pill",
    color: "Black",
    colorSuffix: "B",
  },
  {
    base: "10123",
    name: "Bodø",
    desc: "Softshell Jacket",
    fabric: "3-Layer Waterproof Breathable Softshell 300 GSM",
    color: "Black",
    colorSuffix: "B",
  },
  {
    base: "10124",
    name: "Oslo",
    desc: "Workwear trousers",
    fabric: "65/35 Poly-Cotton Canvas 260 GSM Cordura Reinforced",
    color: "Black",
    colorSuffix: "B",
  },
];

const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

async function seedMissingOnly() {
  console.log("Checking and adding ONLY missing styles to live database...");

  // Category lookup
  let category = await prisma.category.findFirst({
    where: { name: { in: ["Outerwear & Workwear", "General", "Service"] } },
  });
  if (!category) {
    category = await prisma.category.findFirst();
  }

  let barcodeCounter = 400;

  for (const def of missingDefinitions) {
    for (const size of sizes) {
      const sku = `${def.base}-${size}-${def.colorSuffix}`;
      const productName = `${def.name} - ${def.desc} (${def.color}, ${size})`;

      // STRICT CHECK: Only add if SKU does NOT already exist
      const existing = await prisma.product.findFirst({
        where: { OR: [{ sku }, { styleNumber: sku }] },
      });

      if (!existing) {
        barcodeCounter++;
        const barcodeValue = `IMG-2026-000${barcodeCounter}`;

        await prisma.product.create({
          data: {
            sku,
            styleNumber: sku,
            baseStyleNumber: def.base,
            styleName: def.name,
            itemName: def.desc,
            productName,
            fabric: def.fabric,
            color: def.color,
            size,
            brand: "Nordic Prowear",
            purchasePrice: 0,
            salePrice: 0,
            stockQuantity: 50,
            minStockAlert: 5,
            categoryId: category.id,
            isActive: true,
            imageUrl: "/uploads/placeholders/default-article.svg",
            washingInstructionsImageUrl: "/uploads/placeholders/default-washing.svg",
            washingInstructions: "40°C Wash. Do Not Bleach. Tumble Dry Low.",
            barcodes: {
              create: {
                barcodeValue,
                barcodeType: "CODE128",
                barcodeSource: "GENERATED",
                isPrimary: true,
              },
            },
          },
        });
        console.log(`✅ ADDED MISSING VARIANT: ${sku} (${barcodeValue}) -> ${productName}`);
      } else {
        console.log(`SKIPPED EXISTING: ${sku}`);
      }
    }
  }

  console.log("COMPLETED: All missing styles (10121, 10122, 10123, 10124) are now active in Live DB!");
}

seedMissingOnly()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
