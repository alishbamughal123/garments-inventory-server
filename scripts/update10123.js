const prisma = require("../src/config/db");

const sizes = ["XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];

const colorDefinitions = [
  {
    color: "Black",
    colorCode: "B",
    colorSuffix: "B",
    imageUrl: "/uploads/articles/10123-black.png",
  },
  {
    color: "Marineblå",
    colorCode: "N",
    colorSuffix: "NB",
    imageUrl: "/uploads/articles/10123-navy.png",
  },
  {
    color: "Grå",
    colorCode: "G",
    colorSuffix: "G",
    imageUrl: "/uploads/articles/10123-grey.png",
  }
];

const sharedData = {
  baseStyleNumber: "10123",
  styleName: "Bodø",
  itemName: "Softshell jakke",
  brand: "Nordic Prowear",
  fabric: "100% Polyester",
  fabricComposition: "100% Polyester",
  fabricWeight: "250 g/m²",
  washingInstructions: "Vask 40°C • Må ikke blekes • Må ikke tørketromles • Strykes på lav varme • Tåler ikke rens",
  washingInstructionsImageUrl: "/uploads/washing/washing-instructions10123.png",
  description: "Bodø er en moderne og funksjonell softshelljakke utviklet for profesjonell bruk i skiftende værforhold. Jakken er vindtett, pustende og vannavvisende, og gir høy komfort og god bevegelsesfrihet gjennom hele arbeidsdagen. Tre utvendige glidelåslommer, ermlomme og innerlomme gir praktisk oppbevaring av verktøy og personlige eiendeler. Elastiske mansjetter og formsydde ermer sørger for en optimal passform. Refleksdetaljer foran og bak gir økt synlighet i mørke omgivelser.",
  isActive: true,
};

async function update10123() {
  console.log("Updating and syncing Article 10123 (Bodø - Softshell jakke)...");

  // 1. Find or create Workwear category
  let category = await prisma.category.findFirst({
    where: { name: { in: ["Workwear", "Outerwear & Workwear", "General"] } },
  });
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: "Workwear",
        description: "Nordic Prowear Workwear Collection",
      },
    });
  }

  // 2. Update existing 10123 variants
  const updatedExisting = await prisma.product.updateMany({
    where: {
      OR: [
        { baseStyleNumber: "10123" },
        { styleNumber: { startsWith: "10123" } },
        { sku: { startsWith: "10123" } },
      ],
    },
    data: {
      ...sharedData,
      categoryId: category.id,
      imageUrl: "/uploads/articles/10123.png",
    },
  });
  console.log(`Updated ${updatedExisting.count} existing records for Style 10123`);

  // 3. Ensure all official sizes (XXS to 4XL) and color variants exist in database
  for (const colDef of colorDefinitions) {
    for (const size of sizes) {
      const sku = `10123-${size}-${colDef.colorSuffix}`;
      const productName = `Bodø - Softshell jakke (${colDef.color}, ${size})`;

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
        const barcodeValue = `NP-10123-${colDef.colorSuffix}-${size}`;

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

  // Verify updated records
  const allUpdated = await prisma.product.findMany({
    where: {
      OR: [
        { baseStyleNumber: "10123" },
        { styleNumber: { startsWith: "10123" } },
        { sku: { startsWith: "10123" } },
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
      imageUrl: true,
    },
  });

  console.log(`\nSuccessfully verified ${allUpdated.length} variants for Style 10123:`);
  console.log(JSON.stringify(allUpdated.slice(0, 5), null, 2));
}

update10123()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
