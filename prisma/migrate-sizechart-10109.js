const prisma = require("../src/config/db");

// Size chart data structure for article 10109 (Ålesund Coat)
const SIZE_CHART_10109 = {
  title: "Size Card for Article 10109 — Standard Measurements (in cm)",
  applicableStyles: ["10109"],
  unit: "cm",
  sizes: [
    // Standard / Regular Sizes (40/42 to 72/74)
    { key: "40/42", label: "40/42", colorBadge: "navy", colorHex: "#1e3a8a", textHex: "#0f172a", bgLight: "#eff6ff", border: "#bfdbfe" },
    { key: "44/46", label: "44/46", colorBadge: "blue", colorHex: "#2563eb", textHex: "#0f172a", bgLight: "#dbeafe", border: "#93c5fd" },
    { key: "48/50", label: "48/50", colorBadge: "sky blue", colorHex: "#0284c7", textHex: "#0f172a", bgLight: "#e0f2fe", border: "#7dd3fc" },
    { key: "52/54", label: "52/54", colorBadge: "teal", colorHex: "#0d9488", textHex: "#0f172a", bgLight: "#ccfbf1", border: "#5eead4" },
    { key: "56/58", label: "56/58", colorBadge: "green", colorHex: "#16a34a", textHex: "#0f172a", bgLight: "#dcfce7", border: "#86efac" },
    { key: "60/62", label: "60/62", colorBadge: "amber", colorHex: "#d97706", textHex: "#0f172a", bgLight: "#fef3c7", border: "#fcd34d" },
    { key: "64/66", label: "64/66", colorBadge: "orange", colorHex: "#ea580c", textHex: "#0f172a", bgLight: "#ffedd5", border: "#fdba74" },
    { key: "68/70", label: "68/70", colorBadge: "red", colorHex: "#dc2626", textHex: "#0f172a", bgLight: "#fee2e2", border: "#fca5a5" },
    { key: "72/74", label: "72/74", colorBadge: "burgundy", colorHex: "#991b1b", textHex: "#0f172a", bgLight: "#ffe4e6", border: "#fda4af" },

    // Long / Tall Sizes (82/86 to 146/150)
    { key: "82/86", label: "82/86 (Long)", colorBadge: "slate", colorHex: "#475569", textHex: "#0f172a", bgLight: "#f1f5f9", border: "#cbd5e1" },
    { key: "90/94", label: "90/94 (Long)", colorBadge: "indigo", colorHex: "#4f46e5", textHex: "#0f172a", bgLight: "#e0e7ff", border: "#a5b4fc" },
    { key: "98/102", label: "98/102 (Long)", colorBadge: "violet", colorHex: "#7c3aed", textHex: "#0f172a", bgLight: "#ede9fe", border: "#c4b5fd" },
    { key: "106/110", label: "106/110 (Long)", colorBadge: "purple", colorHex: "#9333ea", textHex: "#0f172a", bgLight: "#fae8ff", border: "#f0abfc" },
    { key: "114/118", label: "114/118 (Long)", colorBadge: "fuchsia", colorHex: "#c026d3", textHex: "#0f172a", bgLight: "#fdf4ff", border: "#f5d0fe" },
    { key: "122/126", label: "122/126 (Long)", colorBadge: "pink", colorHex: "#db2777", textHex: "#0f172a", bgLight: "#fce7f3", border: "#fbcfe8" },
    { key: "130/134", label: "130/134 (Long)", colorBadge: "rose", colorHex: "#e11d48", textHex: "#0f172a", bgLight: "#ffe4e6", border: "#fecdd3" },
    { key: "138/142", label: "138/142 (Long)", colorBadge: "bronze", colorHex: "#78350f", textHex: "#0f172a", bgLight: "#fef3c7", border: "#fde68a" },
    { key: "146/150", label: "146/150 (Long)", colorBadge: "dark grey", colorHex: "#334155", textHex: "#0f172a", bgLight: "#f8fafc", border: "#94a3b8" }
  ],
  measurements: [
    {
      code: "1",
      name: "Chest Circumference (Brustumfang)",
      norwegianName: "Brystomkrets (Brustumfang)",
      tolerance: "± 2",
      values: {
        "40/42": "106", "44/46": "114", "48/50": "122", "52/54": "130", "56/58": "138", "60/62": "146", "64/66": "154", "68/70": "162", "72/74": "170",
        "82/86": "106", "90/94": "114", "98/102": "122", "106/110": "130", "114/118": "138", "122/126": "146", "130/134": "154", "138/142": "162", "146/150": "170"
      }
    },
    {
      code: "4",
      name: "Sleeve Length (Ärmellänge)",
      norwegianName: "Ermelengde (Ärmellänge)",
      tolerance: "± 1",
      values: {
        "40/42": "58", "44/46": "63", "48/50": "65", "52/54": "66", "56/58": "67", "60/62": "68", "64/66": "69", "68/70": "70", "72/74": "70",
        "82/86": "65", "90/94": "67", "98/102": "69", "106/110": "70", "114/118": "71", "122/126": "72", "130/134": "73", "138/142": "74", "146/150": "74"
      }
    },
    {
      code: "5",
      name: "Back Length (Rückenlänge)",
      norwegianName: "Rygglengde (Rückenlänge)",
      tolerance: "± 1",
      values: {
        "40/42": "92", "44/46": "94", "48/50": "96", "52/54": "98", "56/58": "102", "60/62": "104", "64/66": "105", "68/70": "106", "72/74": "107",
        "82/86": "97", "90/94": "99", "98/102": "101", "106/110": "103", "114/118": "107", "122/126": "109", "130/134": "110", "138/142": "111", "146/150": "112"
      }
    },
    {
      code: "7",
      name: "Hem / Bottom Width (Saumbreite)",
      norwegianName: "Bunnvidde / Faldvidde (Saumbreite)",
      tolerance: "± 2",
      values: {
        "40/42": "110", "44/46": "118", "48/50": "126", "52/54": "136", "56/58": "146", "60/62": "156", "64/66": "166", "68/70": "176", "72/74": "186",
        "82/86": "110", "90/94": "118", "98/102": "126", "106/110": "136", "114/118": "146", "122/126": "156", "130/134": "166", "138/142": "176", "146/150": "186"
      }
    }
  ]
};

const normalize10109SizeKey = (sizeStr) => {
  if (!sizeStr) return "48/50";
  const s = String(sizeStr).trim().toUpperCase();
  if (SIZE_CHART_10109.sizes.some((sz) => sz.key === s)) return s;

  // Standard mappings for letter sizes
  if (s === "XS" || s === "2XS") return "40/42";
  if (s === "S") return "44/46";
  if (s === "M") return "48/50";
  if (s === "L") return "52/54";
  if (s === "XL") return "56/58";
  if (s === "2XL" || s === "XXL") return "60/62";
  if (s === "3XL" || s === "XXXL") return "64/66";
  if (s === "4XL") return "68/70";
  if (s === "5XL" || s === "6XL") return "72/74";

  return s;
};

const getSingleSize10109 = (sizeKey, chart = SIZE_CHART_10109) => {
  const normalizedKey = normalize10109SizeKey(sizeKey);
  const sizeMeta = chart.sizes.find((s) => s.key === normalizedKey) || chart.sizes[2];

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
    size: sizeMeta.label,
    sizeKey: normalizedKey,
    colorBadge: sizeMeta.colorBadge,
    colorHex: sizeMeta.colorHex,
    unit: chart.unit,
    measurements: breakdown,
  };
};

async function main() {
  console.log("=== SEEDING SIZE CHART FOR 10109 ===");

  const styleNo = "10109";
  const id = `sizechart-${styleNo}`;
  const applicableStylesJson = JSON.stringify(SIZE_CHART_10109.applicableStyles);
  const sizesJson = JSON.stringify(SIZE_CHART_10109.sizes);
  const measurementsJson = JSON.stringify(SIZE_CHART_10109.measurements);

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
  `, id, styleNo, SIZE_CHART_10109.title, applicableStylesJson, sizesJson, measurementsJson);

  console.log(`-> SizeChart record ensured for Style #${styleNo}`);

  // Update products in DB
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { baseStyleNumber: styleNo },
        { styleNumber: { startsWith: styleNo } },
        { sku: { startsWith: styleNo } },
      ],
    },
  });

  console.log(`Found ${products.length} products to update for style ${styleNo}.`);

  let count = 0;
  for (const prod of products) {
    const singleSpec = getSingleSize10109(prod.size, SIZE_CHART_10109);
    const chartJson = JSON.stringify(SIZE_CHART_10109);
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

  console.log(`-> Successfully updated ${count} products with size chart for Style #${styleNo}!`);
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
  SIZE_CHART_10109,
  getSingleSize10109,
  normalize10109SizeKey,
};
