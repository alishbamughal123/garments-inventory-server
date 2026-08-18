const prisma = require("../src/config/db");

async function update10101() {
  try {
    const updateData = {
      fabric: "100% bomull",
      fabricComposition: "100% bomull",
      fabricWeight: "180 g/m²",
      washingInstructions: "Vask 40°C • Vaskes separat • Må ikke blekes • Tørketrommel tillatt • Strykes på middels varme • Profesjonell rens tillatt",
      washingInstructionsImageUrl: "/uploads/washing/washing-instructions10101.png",
      description: "Sandefjord er en klassisk og komfortabel T-shirt utviklet for service-, hospitality- og arbeidsmiljøer. Den er produsert i 100 % bomull av høy kvalitet som gir en myk følelse, god pusteevne og høy komfort gjennom hele arbeidsdagen. Det tidløse designet gjør den godt egnet både alene og som en del av en komplett arbeidsbekledning."
    };

    const res = await prisma.product.updateMany({
      where: {
        OR: [
          { baseStyleNumber: "10101" },
          { styleNumber: { startsWith: "10101" } },
          { sku: { startsWith: "10101" } }
        ]
      },
      data: updateData
    });

    console.log(`Successfully updated ${res.count} variants for Style 10101`);

    const updated = await prisma.product.findMany({
      where: {
        OR: [
          { baseStyleNumber: "10101" },
          { styleNumber: { startsWith: "10101" } },
          { sku: { startsWith: "10101" } }
        ]
      },
      select: {
        sku: true,
        color: true,
        size: true,
        productName: true,
        fabric: true,
        fabricComposition: true,
        fabricWeight: true,
        washingInstructions: true,
        washingInstructionsImageUrl: true,
        imageUrl: true,
        description: true
      }
    });

    console.log("Sample of updated records:", JSON.stringify(updated.slice(0, 5), null, 2));
  } catch (err) {
    console.error("Error updating 10101:", err);
  } finally {
    await prisma.$disconnect();
  }
}

update10101();
