const prisma = require("../src/config/db");

// Exact cost price rules derived from the user's invoice table:
// Rule: Cost Price (NOK) = (USD Price * 1.20) * 10
// Rounding to 2 decimal places (standard financial/decimal storage)
const priceRules = [
  // 10101
  { baseStyle: "10101", colors: ["Black", "Sort"], usd: 3.81, nok: 45.72 },

  // 10102
  { baseStyle: "10102", colors: ["Black", "Sort"], usd: 4.93, nok: 59.16 },

  // 10125
  { baseStyle: "10125", colors: ["Black", "Sort"], usd: 4.19, nok: 50.28 },

  // 10126
  { baseStyle: "10126", colors: ["Black", "Sort"], usd: 5.31, nok: 63.72 },

  // 10115
  { baseStyle: "10115", colors: ["Black", "Sort"], usd: 2.56, nok: 30.72 },
  { baseStyle: "10115", colors: ["Light Grey", "Lys grå", "Grey", "Grå"], usd: 2.56, nok: 30.72 },

  // 10106
  { baseStyle: "10106", colors: ["White", "Hvit"], usd: 7.36, nok: 88.32 },
  { baseStyle: "10106", colors: ["Navy", "Marine", "Navy Blue", "Marineblå"], usd: 8.26, nok: 99.12 },
  { baseStyle: "10106", colors: ["Grey", "Grå", "Lys grå"], usd: 8.26, nok: 99.12 },

  // 10103
  { baseStyle: "10103", colors: ["White", "Hvit"], usd: 8.86, nok: 106.32 },

  // 10107
  { baseStyle: "10107", colors: ["White", "Hvit"], usd: 5.71, nok: 68.52 },
  { baseStyle: "10107", colors: ["Navy", "Marine", "Navy Blue", "Marineblå"], usd: 7.44, nok: 89.28 },

  // 10108
  { baseStyle: "10108", colors: ["White", "Hvit"], usd: 5.71, nok: 68.52 },
  { baseStyle: "10108", colors: ["Navy", "Marine", "Navy Blue", "Marineblå"], usd: 7.44, nok: 89.28 },
  { baseStyle: "10108", colors: ["Grey", "Grå", "Lys grå"], usd: 7.44, nok: 89.28 },

  // 10105
  { baseStyle: "10105", colors: ["Navy", "Marine", "Navy Blue", "Marineblå"], usd: 7.63, nok: 91.56 },
  { baseStyle: "10105", colors: ["White", "Hvit"], usd: 7.63, nok: 91.56 },

  // 10116
  { baseStyle: "10116", colors: ["White", "Hvit"], usd: 5.71, nok: 68.52 },

  // 10109
  { baseStyle: "10109", colors: ["White", "Hvit"], usd: 9.71, nok: 116.52 },

  // 10113
  { baseStyle: "10113", colors: ["White", "Hvit"], usd: 2.78, nok: 33.36 },

  // 10114
  { baseStyle: "10114", colors: ["White", "Hvit"], usd: 2.78, nok: 33.36 },

  // 20110
  { baseStyle: "20110", colors: ["White", "Hvit"], usd: 9.72, nok: 116.64 },
  { baseStyle: "20110", colors: ["Black", "Sort"], usd: 11.02, nok: 132.24 },

  // 20111
  { baseStyle: "20111", colors: ["White", "Hvit"], usd: 8.66, nok: 103.92 },
  { baseStyle: "20111", colors: ["Black", "Sort"], usd: 10.13, nok: 121.56 },

  // 200120
  { baseStyle: "200120", colors: ["White", "Hvit"], usd: 8.36, nok: 100.32 },
  { baseStyle: "200120", colors: ["Black", "Sort"], usd: 10.13, nok: 121.56 },

  // 200123
  { baseStyle: "200123", colors: ["White", "Hvit"], usd: 10.08, nok: 120.96 },
  { baseStyle: "200123", colors: ["Black", "Sort"], usd: 9.53, nok: 114.36 },

  // 200126
  { baseStyle: "200126", colors: ["Black", "Sort"], usd: 9.30, nok: 111.60 },

  // 200128
  { baseStyle: "200128", colors: ["Black", "Sort"], usd: 2.48, nok: 29.76 },

  // 200127
  { baseStyle: "200127", colors: ["Black", "Sort"], usd: 9.18, nok: 110.16 },

  // 200121
  { baseStyle: "200121", colors: ["Black and white Papi", "Pepita", "Black/white papeta", "Black/White Pepita"], usd: 12.00, nok: 144.00 },

  // 200122
  { baseStyle: "200122", colors: ["Black and white Stri", "Stripe (B/W)", "Black/White Stripes", "Black/white papeta"], usd: 11.31, nok: 135.72 },

  // 200124
  { baseStyle: "200124", colors: ["Black/White Pepita", "Pepita", "Black and white Papi", "Black/white papeta"], usd: 11.22, nok: 134.64 },

  // 200125
  { baseStyle: "200125", colors: ["Black and white Stri", "Black/White Stripes", "Stripe (B/W)", "Black/white papeta"], usd: 9.54, nok: 114.48 }
];

async function applyCostPrices() {
  console.log("=== APPLYING COST PRICES TO DEV DATABASE (garments_dev) ===");
  
  let totalUpdated = 0;
  const updateSummary = [];

  for (const rule of priceRules) {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { baseStyleNumber: rule.baseStyle },
          { styleNumber: { startsWith: rule.baseStyle } },
          { sku: { startsWith: rule.baseStyle } }
        ],
        color: { in: rule.colors }
      },
      select: { id: true, sku: true, productName: true, color: true, size: true, purchasePrice: true }
    });

    if (products.length > 0) {
      const updateRes = await prisma.product.updateMany({
        where: {
          id: { in: products.map(p => p.id) }
        },
        data: {
          purchasePrice: rule.nok
        }
      });

      totalUpdated += updateRes.count;
      updateSummary.push({
        baseStyle: rule.baseStyle,
        colors: rule.colors.join(", "),
        usdPrice: `$${rule.usd.toFixed(2)}`,
        usdWith20: `$${(rule.usd * 1.2).toFixed(3)}`,
        costPriceNOK: `NOK ${rule.nok.toFixed(2)}`,
        matchedVariants: updateRes.count
      });
    } else {
      console.warn(`[WARNING] No products matched for BaseStyle: ${rule.baseStyle}, Colors: [${rule.colors.join(", ")}]`);
    }
  }

  console.table(updateSummary);
  console.log(`\n Total variants updated with cost prices: ${totalUpdated}`);

  // Also verify products that remain 0 / untouched
  const untouched = await prisma.product.findMany({
    where: {
      purchasePrice: 0
    },
    select: {
      sku: true,
      productName: true,
      color: true,
      size: true,
      purchasePrice: true
    }
  });

  console.log(`\n Products left unpriced / untouched (cost price = 0): ${untouched.length}`);
  const untouchedStyles = {};
  untouched.forEach(p => {
    const bStyle = p.sku.split("-")[0];
    if (!untouchedStyles[bStyle]) untouchedStyles[bStyle] = new Set();
    untouchedStyles[bStyle].add(p.color);
  });
  for (const [st, cols] of Object.entries(untouchedStyles)) {
    console.log(`  Style ${st}: [${Array.from(cols).join(", ")}]`);
  }
}

applyCostPrices()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error("Error applying cost prices:", err);
    prisma.$disconnect();
  });
