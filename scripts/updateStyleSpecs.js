const prisma = require("../src/config/db");

async function updateStyles(updates) {
  try {
    for (const item of updates) {
      const { styleNo, fabric, fabricComposition, fabricWeight } = item;
      console.log(`Updating Style No: ${styleNo}...`);

      const updateData = {};
      if (fabric !== undefined) updateData.fabric = fabric;
      if (fabricComposition !== undefined) updateData.fabricComposition = fabricComposition;
      if (fabricWeight !== undefined) updateData.fabricWeight = fabricWeight;

      const result = await prisma.product.updateMany({
        where: {
          OR: [
            { baseStyleNumber: String(styleNo) },
            { styleNumber: { startsWith: String(styleNo) } },
            { sku: { startsWith: String(styleNo) } }
          ]
        },
        data: updateData
      });

      console.log(`Updated ${result.count} products for style ${styleNo}`);

      // Fetch and display updated records
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { baseStyleNumber: String(styleNo) },
            { styleNumber: { startsWith: String(styleNo) } },
            { sku: { startsWith: String(styleNo) } }
          ]
        },
        select: {
          id: true,
          sku: true,
          size: true,
          productName: true,
          fabric: true,
          fabricComposition: true,
          fabricWeight: true
        }
      });

      console.log(`Current data for Style ${styleNo}:`, JSON.stringify(products, null, 2));
    }
  } catch (error) {
    console.error("Error updating styles:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Styles to update
const updates = [
  {
    styleNo: "200124",
    fabricWeight: "210/gm^2",
    fabricComposition: "100% cotton",
    fabric: "cotton"
  }
];

updateStyles(updates);
