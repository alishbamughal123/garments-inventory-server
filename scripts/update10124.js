const prisma = require("../src/config/db");

async function update10124() {
  try {
    const updateData = {
      fabric: "58% polyester, 39% bomull, 3% lycra, 3/1 twill (PCL-47)",
      fabricComposition: "58% polyester, 39% bomull, 3% lycra, 3/1 twill (PCL-47)",
      fabricWeight: "240 g/m²",
      washingInstructions: "Vaskes på 40°C • Ikke bruk klorblekemiddel • Tørketrommel på lav varme eller lufttørkes • Strykes på lav temperatur (maks 110–150°C) • Ikke renses",
      washingInstructionsImageUrl: "/uploads/washing/washing-instructions10124.png",
      imageUrl: "/uploads/articles/10124.png",
      description: "Oslo er en lett og slitesterk arbeidsbukse med moderne passform og høy funksjonalitet. Buksen er laget i et slitesterkt og fleksibelt materiale som gir optimal bevegelsesfrihet og komfort gjennom hele arbeidsdagen. Flere praktiske lommer gir god oppbevaringsplass til verktøy og personlige eiendeler. Forsterkede områder på knær og benavslutning øker slitestyrke og levetid."
    };

    const res = await prisma.product.updateMany({
      where: {
        OR: [
          { baseStyleNumber: "10124" },
          { styleNumber: { startsWith: "10124" } },
          { sku: { startsWith: "10124" } }
        ]
      },
      data: updateData
    });

    console.log(`Successfully updated ${res.count} variants for Style 10124`);

    const updated = await prisma.product.findMany({
      where: {
        OR: [
          { baseStyleNumber: "10124" },
          { styleNumber: { startsWith: "10124" } },
          { sku: { startsWith: "10124" } }
        ]
      },
      select: {
        sku: true,
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

    console.log("Updated records:", JSON.stringify(updated, null, 2));
  } catch (err) {
    console.error("Error updating 10124:", err);
  } finally {
    await prisma.$disconnect();
  }
}

update10124();
