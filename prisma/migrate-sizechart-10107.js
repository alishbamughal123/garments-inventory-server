const prisma = require("../src/config/db");

// Size chart data structure for articles 10107 and 10108 (Trouser / Bukse)
const SIZE_CHART_10107_10108 = {
  title: "Size chart for article 10107 and 10108",
  applicableStyles: ["10107", "10108"],
  unit: "cm",
  sizes: [
    { key: "2XS", label: "2X-SMALL", colorBadge: "light grey", colorHex: "#cbd5e1", textHex: "#334155", bgLight: "#f8fafc", border: "#cbd5e1" },
    { key: "XS", label: "X-SMALL", colorBadge: "yellow", colorHex: "#eab308", textHex: "#854d0e", bgLight: "#fef9c3", border: "#fde047" },
    { key: "S", label: "SMALL", colorBadge: "green", colorHex: "#22c55e", textHex: "#14532d", bgLight: "#dcfce7", border: "#86efac" },
    { key: "M", label: "MEDIUM", colorBadge: "medium blue", colorHex: "#3b82f6", textHex: "#1e3a8a", bgLight: "#dbeafe", border: "#93c5fd" },
    { key: "L", label: "LARGE", colorBadge: "red", colorHex: "#ef4444", textHex: "#7f1d1d", bgLight: "#fee2e2", border: "#fca5a5" },
    { key: "XL", label: "X-LARGE", colorBadge: "black", colorHex: "#1e293b", textHex: "#ffffff", bgLight: "#f1f5f9", border: "#cbd5e1" },
    { key: "2XL", label: "2X-LARGE", colorBadge: "violet", colorHex: "#8b5cf6", textHex: "#ffffff", bgLight: "#ede9fe", border: "#c4b5fd" },
    { key: "3XL", label: "3X-LARGE", colorBadge: "brown", colorHex: "#78350f", textHex: "#ffffff", bgLight: "#fef3c7", border: "#d97706" },
    { key: "4XL", label: "4X-LARGE", colorBadge: "orange", colorHex: "#ea580c", textHex: "#ffffff", bgLight: "#ffedd5", border: "#fb923c" },
    { key: "5XL", label: "5X-LARGE", colorBadge: "turquoise", colorHex: "#06b6d4", textHex: "#ffffff", bgLight: "#cffafe", border: "#67e8f9" },
    { key: "6XL", label: "6X-LARGE", colorBadge: "light grey", colorHex: "#94a3b8", textHex: "#ffffff", bgLight: "#f1f5f9", border: "#94a3b8" }
  ],
  measurements: [
    {
      code: "ELASTIC",
      name: "Elastic in half waistband at back, cut length",
      norwegianName: "Strikk i halv linning bak, klippelengde",
      tolerance: "± 1",
      values: { "2XS": "—", XS: "—", S: "—", M: "—", L: "—", XL: "—", "2XL": "—", "3XL": "—", "4XL": "—", "5XL": "—", "6XL": "—" }
    },
    {
      code: "A",
      name: "Waist circumference without elastic",
      norwegianName: "Midjevidde uten strikk",
      tolerance: "± 2",
      values: { "2XS": "86", XS: "90", S: "94", M: "102", L: "110", XL: "122", "2XL": "130", "3XL": "146", "4XL": "158", "5XL": "167", "6XL": "176" }
    },
    {
      code: "B",
      name: "Hip width",
      norwegianName: "Hoftevidde",
      tolerance: "± 2",
      values: { "2XS": "99", XS: "102", S: "105", M: "111", L: "118", XL: "130", "2XL": "142", "3XL": "149", "4XL": "158", "5XL": "167", "6XL": "176" }
    },
    {
      code: "C",
      name: "Stride length inner",
      norwegianName: "Innside benlengde",
      tolerance: "± 2",
      values: { "2XS": "77", XS: "79", S: "82", M: "86", L: "89", XL: "90", "2XL": "90", "3XL": "92", "4XL": "92", "5XL": "92", "6XL": "92" }
    },
    {
      code: "D",
      name: "Thigh width / Lårvidde",
      norwegianName: "Lårvidde",
      tolerance: "± 2",
      values: { "2XS": "60", XS: "65", S: "69", M: "72", L: "76", XL: "80", "2XL": "84", "3XL": "93", "4XL": "97", "5XL": "105", "6XL": "109" }
    },
    {
      code: "E",
      name: "Foot width with extended rib",
      norwegianName: "Fotvidde med utstrakt ribb",
      tolerance: "± 1",
      values: { "2XS": "39", XS: "39", S: "41", M: "41", L: "41", XL: "43", "2XL": "43", "3XL": "50", "4XL": "51", "5XL": "51", "6XL": "51" }
    },
    {
      code: "F1",
      name: "Front waist height (excl. waistband)",
      norwegianName: "Livhøyde foran (ekskl. linning)",
      tolerance: "± 1",
      values: { "2XS": "21", XS: "24", S: "27", M: "29", L: "33", XL: "33", "2XL": "33", "3XL": "35", "4XL": "35", "5XL": "35", "6XL": "35" }
    },
    {
      code: "F2",
      name: "Waist height at the back (excl. waistband)",
      norwegianName: "Livhøyde bak (ekskl. linning)",
      tolerance: "± 1",
      values: { "2XS": "33", XS: "36", S: "40", M: "42", L: "46", XL: "46", "2XL": "47", "3XL": "48", "4XL": "48", "5XL": "51", "6XL": "54" }
    },
    {
      code: "G",
      name: "Position back pocket to side seam",
      norwegianName: "Plassering baklomme til sidesøm",
      tolerance: "± 1",
      values: { "2XS": "2", XS: "3", S: "4", M: "4", L: "5", XL: "6", "2XL": "7", "3XL": "7", "4XL": "8", "5XL": "9", "6XL": "10" }
    },
    {
      code: "H",
      name: "Breadth of running gait in waist",
      norwegianName: "Bredde på løpegang i midje",
      tolerance: "± 1",
      values: { "2XS": "3", XS: "3", S: "3", M: "3", L: "3", XL: "3", "2XL": "3", "3XL": "3", "4XL": "3", "5XL": "3", "6XL": "3" }
    },
    {
      code: "TAG",
      name: "Distance from waistband to tag",
      norwegianName: "Avstand fra linning til merke",
      tolerance: "± 1",
      values: { "2XS": "5", XS: "5", S: "5", M: "5", L: "5", XL: "5", "2XL": "5", "3XL": "5", "4XL": "5", "5XL": "5", "6XL": "5" }
    },
    {
      code: "LEG",
      name: "Width of the leg running gait",
      norwegianName: "Bredde på løpegang i ben",
      tolerance: "—",
      values: { "2XS": "3", XS: "3", S: "3", M: "3", L: "3", XL: "3", "2XL": "3", "3XL": "3", "4XL": "3", "5XL": "3", "6XL": "3" }
    },
    {
      code: "K",
      name: "Position back pocket to top edge",
      norwegianName: "Plassering baklomme til toppkant",
      tolerance: "—",
      values: { "2XS": "10", XS: "10", S: "10", M: "10", L: "10", XL: "10", "2XL": "10", "3XL": "10", "4XL": "10", "5XL": "10", "6XL": "10" }
    },
    {
      code: "L",
      name: "Length",
      norwegianName: "Totallengde",
      tolerance: "± 1",
      values: { "2XS": "96", XS: "100.5", S: "105.5", M: "109.5", L: "115.5", XL: "117.5", "2XL": "118.5", "3XL": "120", "4XL": "120", "5XL": "121", "6XL": "121" }
    }
  ]
};

const normalizeSizeKey = (sizeStr) => {
  if (!sizeStr) return null;
  const s = String(sizeStr).trim().toUpperCase();
  if (s === "2XS" || s === "XXS" || s === "2X-SMALL" || s === "EXTRA EXTRA SMALL") return "2XS";
  if (s === "XS" || s === "X-SMALL" || s === "EXTRA SMALL") return "XS";
  if (s === "S" || s === "SMALL") return "S";
  if (s === "M" || s === "MEDIUM" || s === "MED") return "M";
  if (s === "L" || s === "LARGE") return "L";
  if (s === "XL" || s === "X-LARGE" || s === "EXTRA LARGE") return "XL";
  if (s === "2XL" || s === "XXL" || s === "2X-LARGE") return "2XL";
  if (s === "3XL" || s === "XXXL" || s === "3X-LARGE") return "3XL";
  if (s === "4XL" || s === "XXXXL" || s === "4X-LARGE") return "4XL";
  if (s === "5XL" || s === "5X-LARGE") return "5XL";
  if (s === "6XL" || s === "6X-LARGE") return "6XL";
  return s;
};

const getSingleSizeMeasurements = (sizeKey, chart) => {
  const normalizedKey = normalizeSizeKey(sizeKey);
  const sizeMeta = chart.sizes.find((s) => s.key === normalizedKey);

  const breakdown = {};
  chart.measurements.forEach((m) => {
    breakdown[m.code] = {
      name: m.name,
      norwegianName: m.norwegianName,
      value: m.values[normalizedKey] || "—",
      tolerance: m.tolerance,
    };
  });

  return {
    size: sizeMeta ? sizeMeta.label : sizeKey,
    sizeKey: normalizedKey || sizeKey,
    colorBadge: sizeMeta ? sizeMeta.colorBadge : "standard",
    colorHex: sizeMeta ? sizeMeta.colorHex : "#3b82f6",
    unit: chart.unit,
    measurements: breakdown,
  };
};

async function main() {
  console.log("=== SEEDING SIZE CHART FOR 10107 & 10108 ===");

  const stylesToSeed = ["10107", "10108"];

  for (const styleNo of stylesToSeed) {
    const id = `sizechart-${styleNo}`;
    const applicableStylesJson = JSON.stringify(SIZE_CHART_10107_10108.applicableStyles);
    const sizesJson = JSON.stringify(SIZE_CHART_10107_10108.sizes);
    const measurementsJson = JSON.stringify(SIZE_CHART_10107_10108.measurements);

    await prisma.$executeRawUnsafe(`
      INSERT INTO "SizeChart" ("id", "styleNumber", "title", "applicableStyles", "sizes", "measurements", "unit", "updatedAt")
      VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, 'cm', CURRENT_TIMESTAMP)
      ON CONFLICT ("styleNumber") DO UPDATE SET
        "title" = EXCLUDED."title",
        "applicableStyles" = EXCLUDED."applicableStyles",
        "sizes" = EXCLUDED."sizes",
        "measurements" = EXCLUDED."measurements",
        "unit" = EXCLUDED."unit",
        "updatedAt" = CURRENT_TIMESTAMP;
    `, id, styleNo, `Size chart for article ${styleNo}`, applicableStylesJson, sizesJson, measurementsJson);

    console.log(`-> SizeChart record ensured for Style #${styleNo}`);
  }

  // Update products in DB
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { baseStyleNumber: { in: stylesToSeed } },
        { styleNumber: { startsWith: "10107" } },
        { styleNumber: { startsWith: "10108" } },
        { sku: { startsWith: "10107" } },
        { sku: { startsWith: "10108" } },
      ],
    },
  });

  console.log(`Found ${products.length} products to update for styles 10107 and 10108.`);

  let count = 0;
  for (const prod of products) {
    const singleSpec = getSingleSizeMeasurements(prod.size, SIZE_CHART_10107_10108);
    const chartJson = JSON.stringify(SIZE_CHART_10107_10108);
    const singleSpecJson = JSON.stringify(singleSpec);

    await prisma.$executeRawUnsafe(`
      UPDATE "Product"
      SET "sizeChart" = $1::jsonb,
          "sizeChartMeasurements" = $2::jsonb,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = $3;
    `, chartJson, singleSpecJson, prod.id);

    count++;
  }

  console.log(`-> Successfully updated ${count} products with size chart for 10107 & 10108!`);
}

if (require.main === module) {
  main()
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error("Migration error:", e);
      await prisma.$disconnect();
      process.exit(1);
    });
}

module.exports = {
  SIZE_CHART_10107_10108,
  getSingleSizeMeasurements,
  normalizeSizeKey,
};
