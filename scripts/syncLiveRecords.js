const prisma = require("../src/config/db");

const items10101 = [
  {
    style: "10101",
    name: "BASIC S/S TEE",
    fabric: "100% COTTON 160 GSM JERSEY - OEKOTEX",
    fabricWeight: "160 GSM",
    color: "Bright White",
    colorCode: "11-0601 TCX",
    colorSuffix: "W",
  },
  {
    style: "10101",
    name: "BASIC S/S TEE",
    fabric: "100% COTTON 160 GSM JERSEY - OEKOTEX",
    fabricWeight: "160 GSM",
    color: "Black",
    colorCode: "19-0303 TCX",
    colorSuffix: "B",
  },
  {
    style: "10101",
    name: "BASIC S/S TEE",
    fabric: "100% COTTON 160 GSM JERSEY - OEKOTEX",
    fabricWeight: "160 GSM",
    color: "Navy Blue",
    colorCode: "19-4024 TCX",
    colorSuffix: "NB",
  },
];

const items10102 = [
  {
    style: "10102",
    name: "BASIC S/S POLO",
    fabric: "65/35 POLY COTTON 210 GSM OEKOTEX",
    fabricWeight: "210 GSM",
    color: "Bright White",
    colorCode: "11-0601 TCX",
    colorSuffix: "W",
  },
  {
    style: "10102",
    name: "BASIC S/S POLO",
    fabric: "65/35 POLY COTTON 210 GSM OEKOTEX",
    fabricWeight: "210 GSM",
    color: "Black",
    colorCode: "19-0303 TCX",
    colorSuffix: "B",
  },
  {
    style: "10102",
    name: "BASIC S/S POLO",
    fabric: "65/35 POLY COTTON 210 GSM OEKOTEX",
    fabricWeight: "210 GSM",
    color: "Navy Blue",
    colorCode: "19-4024 TCX",
    colorSuffix: "NB",
  },
];

const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

async function syncRecords() {
  console.log("Starting Article Sync for 10101 and 10102...");

  let category = await prisma.category.findFirst({
    where: { name: { in: ["General", "T-Shirt", "Service"] } },
  });
  if (!category) {
    category = await prisma.category.findFirst();
  }

  const allDefinitions = [...items10101, ...items10102];
  let barcodeCounter = 300;

  for (const def of allDefinitions) {
    for (const size of sizes) {
      const sku = `${def.style}-${size}-${def.colorSuffix}`;
      const prefix = def.style === "10101" ? "Sandefjord" : "Tønsberg";
      const productName = `${prefix} - ${def.name} (${def.color}, ${size})`;

      const existing = await prisma.product.findFirst({
        where: { OR: [{ sku }, { styleNumber: sku }] },
        include: { barcodes: true },
      });

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            productName,
            baseStyleNumber: def.style,
            styleName: def.name,
            itemName: def.name,
            fabric: def.fabric,
            fabricWeight: def.fabricWeight,
            color: def.color,
            colorCode: def.colorCode,
            size,
            brand: "Nordic Prowear",
            isActive: true,
          },
        });
        console.log(`UPDATED: ${sku} -> ${productName}`);
      } else {
        barcodeCounter++;
        const barcodeValue = `IMG-2026-000${barcodeCounter}`;
        await prisma.product.create({
          data: {
            sku,
            styleNumber: sku,
            baseStyleNumber: def.style,
            styleName: def.name,
            itemName: def.name,
            productName,
            fabric: def.fabric,
            fabricWeight: def.fabricWeight,
            color: def.color,
            colorCode: def.colorCode,
            size,
            brand: "Nordic Prowear",
            purchasePrice: 0,
            salePrice: 0,
            stockQuantity: 100,
            minStockAlert: 10,
            categoryId: category.id,
            isActive: true,
            imageUrl: "/uploads/placeholders/default-article.svg",
            washingInstructionsImageUrl: "/uploads/placeholders/default-washing.svg",
            washingInstructions: "40°C Standard Wash. Do Not Bleach. Tumble Dry Low.",
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
        console.log(`CREATED: ${sku} (${barcodeValue}) -> ${productName}`);
      }
    }
  }

  console.log("SYNC FINISHED: All 42 article variants for 10101 and 10102 are up-to-date in Neon DB!");
}

syncRecords()
  .catch((err) => console.error("SYNC ERROR:", err))
  .finally(() => prisma.$disconnect());
