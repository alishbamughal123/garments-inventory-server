const prisma = require("../src/config/db");

const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];

const colorDefinitions = [
  {
    color: "Black/White Pepita",
    colorCode: "BP",
    colorSuffix: "BP",
    imageUrl: "/uploads/articles/200124.png",
  },
  {
    color: "Black",
    colorCode: "B",
    colorSuffix: "B",
    imageUrl: "/uploads/articles/200124-black.png",
  },
  {
    color: "White",
    colorCode: "W",
    colorSuffix: "W",
    imageUrl: "/uploads/articles/200124-white.png",
  },
  {
    color: "Navy Blue",
    colorCode: "NB",
    colorSuffix: "NB",
    imageUrl: "/uploads/articles/200124-navy.png",
  }
];

const sharedData = {
  baseStyleNumber: "200124",
  styleName: "Piteå",
  itemName: "Kokkebukse pepita dame",
  brand: "Nordic Prowear",
  fabric: "100% bomull",
  fabricComposition: "100% bomull",
  fabricWeight: "210 g/m²",
  washingInstructions: "Vask 75°C • Vaskes separat • Må ikke blekes • Tørketrommel tillatt • Strykes på middels varme • Profesjonell rens tillatt",
  washingInstructionsImageUrl: "/uploads/washing/washing-instructions200124.png",
  description: "Denne buksen til dame har en middels høy midje og er utviklet for høy komfort gjennom hele arbeidsdagen. Det klassiske 5-lommers designet gir et profesjonelt uttrykk og god plass til nødvendige arbeidsredskaper. Den fleksible elastiske linningen sikrer optimal passform og god bevegelsesfrihet.",
  isActive: true,
};

async function update200124() {
  console.log("Updating and syncing Article 200124 (Piteå - Kokkebukse pepita dame)...");

  // 1. Find or create Hospitality category
  let category = await prisma.category.findFirst({
    where: { name: { in: ["Hospitality", "Service", "Outerwear & Workwear", "General"] } },
  });
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: "Hospitality",
        description: "Nordic Prowear Hospitality Collection - Chef & Service Wear",
      },
    });
  }

  // 2. Update all existing 200124 variants in database
  const updatedExisting = await prisma.product.updateMany({
    where: {
      OR: [
        { baseStyleNumber: "200124" },
        { styleNumber: { startsWith: "200124" } },
        { sku: { startsWith: "200124" } },
      ],
    },
    data: {
      ...sharedData,
      categoryId: category.id,
      imageUrl: "/uploads/articles/200124.png",
    },
  });
  console.log(`Updated ${updatedExisting.count} existing records for Style 200124`);

  // 3. Ensure all official sizes (XS to 4XL) and color variants exist in database
  let barcodeCounter = 500;

  for (const colDef of colorDefinitions) {
    for (const size of sizes) {
      const sku = `200124-${size}-${colDef.colorSuffix}`;
      const productName = `Piteå - Kokkebukse pepita dame (${colDef.color}, ${size})`;

      const existing = await prisma.product.findFirst({
        where: { OR: [{ sku }, { styleNumber: sku }] },
        include: { barcodes: true },
      });

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            ...sharedData,
            productName,
            color: colDef.color,
            colorCode: colDef.colorCode,
            size,
            imageUrl: colDef.imageUrl,
            categoryId: category.id,
          },
        });
        console.log(`UPDATED: ${sku} -> ${productName}`);
      } else {
        barcodeCounter++;
        const barcodeValue = `NP-200124-${colDef.colorSuffix}-${size}`;

        await prisma.product.create({
          data: {
            ...sharedData,
            sku,
            styleNumber: sku,
            productName,
            color: colDef.color,
            colorCode: colDef.colorCode,
            size,
            imageUrl: colDef.imageUrl,
            categoryId: category.id,
            purchasePrice: 0,
            salePrice: 0,
            stockQuantity: 50,
            minStockAlert: 5,
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

  // 4. Also update any numeric size variants like 200124-44-BWP, 200124-46-BWP, 200124-48-BWP with correct naming
  const numericVariants = await prisma.product.findMany({
    where: {
      OR: [
        { sku: { startsWith: "200124-4" } },
        { sku: { startsWith: "200124-5" } },
      ],
    },
  });

  for (const nv of numericVariants) {
    const productName = `Piteå - Kokkebukse pepita dame (Black/White Pepita, ${nv.size})`;
    await prisma.product.update({
      where: { id: nv.id },
      data: {
        ...sharedData,
        productName,
        color: "Black/White Pepita",
        colorCode: "BP",
        imageUrl: "/uploads/articles/200124.png",
      },
    });
    console.log(`UPDATED numeric variant: ${nv.sku} -> ${productName}`);
  }

  // Verify and display sample of updated records
  const allUpdated = await prisma.product.findMany({
    where: {
      OR: [
        { baseStyleNumber: "200124" },
        { styleNumber: { startsWith: "200124" } },
        { sku: { startsWith: "200124" } },
      ],
    },
    select: {
      sku: true,
      productName: true,
      color: true,
      size: true,
      fabric: true,
      fabricComposition: true,
      fabricWeight: true,
      washingInstructions: true,
      washingInstructionsImageUrl: true,
      imageUrl: true,
      description: true,
    },
  });

  console.log(`\nSuccessfully verified ${allUpdated.length} variants for Style 200124:`);
  console.log(JSON.stringify(allUpdated.slice(0, 4), null, 2));
}

update200124()
  .catch((err) => {
    console.error("Error updating 200124:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
