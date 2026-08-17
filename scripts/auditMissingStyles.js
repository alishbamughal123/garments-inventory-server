const prisma = require("../src/config/db");

const targetStyles = [
  { base: "10101", name: "Sandefjord", desc: "T-Shirt", colors: ["Black", "Bright White", "Navy Blue"] },
  { base: "10102", name: "Tønsberg", desc: "Polo Shirt", colors: ["Black", "Bright White", "Navy Blue"] },
  { base: "10103", name: "Molde", desc: "Shirt", colors: ["White"] },
  { base: "10105", name: "Lillehammer", desc: "Scrubs unisex NS3361", colors: ["Navy", "White"] },
  { base: "10106", name: "Stavanger", desc: "Scrubs unisex NS3361", colors: ["White", "Navy"] },
  { base: "10107", name: "Hamar", desc: "Trouser Unisex NS3357", colors: ["Navy", "White"] },
  { base: "10108", name: "Bergen", desc: "Trouser Unisex NS3357", colors: ["Grey", "Navy", "White"] },
  { base: "10109", name: "Ålesund", desc: "Coat Unisex", colors: ["White"] },
  { base: "10113", name: "Århus", desc: "Chef Hat", colors: ["White"] },
  { base: "10114", name: "Malmö", desc: "Chef Hat", colors: ["White"] },
  { base: "10115", name: "København", desc: "Apron", colors: ["Black", "Light Grey"] },
  { base: "10116", name: "Hamar", desc: "Trouser Unisex NS3357", colors: ["White"] },
  { base: "10121", name: "Drammen", desc: "Sweat shirt", colors: ["Black"] },
  { base: "10122", name: "Kalmar", desc: "Fleece", colors: ["Black"] },
  { base: "10123", name: "Bodø", desc: "Softshell Jacket", colors: ["Black"] },
  { base: "10124", name: "Oslo", desc: "Workwear trousers", colors: ["Black"] },
  { base: "20110", name: "Stockholm", desc: "Chef Jacket Full Sleeves", colors: ["Black", "White"] },
  { base: "20111", name: "Borås", desc: "Chef Jacket Full Sleeves", colors: ["Black", "White"] },
  { base: "200120", name: "Odense", desc: "Men´s chef´s trouser", colors: ["Black", "White"] },
  { base: "200121", name: "Vejle", desc: "Men´s chef´s trouser", colors: ["black/white pepita"] },
  { base: "200122", name: "Skagen", desc: "Men´s chef´s trouser", colors: ["black/white stripe"] },
  { base: "200123", name: "Åre", desc: "Lady´s chef´s trouser", colors: ["Black", "White"] },
  { base: "200124", name: "Piteå", desc: "Lady´s chef´s trouser", colors: ["black/white pepita"] },
  { base: "200125", name: "Umeå", desc: "Lady´s chef´s trouser", colors: ["black/white stripe"] },
  { base: "200126", name: "Arendal", desc: "Men´s chef´s trouser", colors: ["black"] },
  { base: "200127", name: "Haugesund", desc: "Men´s chef´s trouser", colors: ["black"] },
  { base: "200128", name: "Mandal", desc: "apron 80 x 45 cm with fabric ties", colors: ["Black"] },
];

async function check() {
  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      sku: true,
      styleNumber: true,
      baseStyleNumber: true,
      productName: true,
      color: true,
      size: true,
    },
  });

  console.log(`TOTAL PRODUCTS IN DB: ${allProducts.length}`);
  console.log("--------------------------------------------------");

  const missingStyles = [];
  const existingStyles = [];

  for (const t of targetStyles) {
    const matching = allProducts.filter(
      (p) =>
        p.baseStyleNumber === t.base ||
        (p.sku && p.sku.startsWith(t.base + "-")) ||
        (p.styleNumber && p.styleNumber.startsWith(t.base + "-")) ||
        p.sku === t.base
    );

    if (matching.length === 0) {
      missingStyles.push(t);
      console.log(`❌ MISSING: Style #${t.base} (${t.name} - ${t.desc}) [0 variants in DB]`);
    } else {
      existingStyles.push({ ...t, count: matching.length, skus: matching.map((m) => m.sku) });
      console.log(`✅ EXISTS: Style #${t.base} (${t.name} - ${t.desc}) [${matching.length} variants in DB]`);
    }
  }

  console.log("--------------------------------------------------");
  console.log(`SUMMARY: ${existingStyles.length} styles exist, ${missingStyles.length} styles missing.`);
  console.log("MISSING LIST:", missingStyles.map((m) => `#${m.base} ${m.name}`).join(", "));
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
