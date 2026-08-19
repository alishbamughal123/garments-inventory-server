const prisma = require("../../config/db");
const {
  SIZE_CHART_10101,
  SIZE_CHART_10102,
  SIZE_CHART_10105_10106_10116,
  SIZE_CHART_10107_10108,
  SIZE_CHART_10109,
  SIZE_CHART_10122,
  SIZE_CHART_10123,
  SIZE_CHART_10124,
  SIZE_CHART_20110,
  SIZE_CHART_20111,
  SIZE_CHART_200120,
  SIZE_CHART_200123,
  SIZE_CHART_200126,
  SIZE_CHART_200127,
  STATIC_CHARTS,
  getSingleSizeMeasurements,
  normalizeSizeKey,
} = require("./sizechart.constants");

const getSizeCharts = async () => {
  try {
    const charts = await prisma.$queryRaw`
      SELECT * FROM "SizeChart" ORDER BY "styleNumber" ASC
    `;
    if (charts && charts.length > 0) return charts;
  } catch (err) {
    console.warn("DB SizeChart query fallback:", err.message);
  }
  return Object.entries(STATIC_CHARTS).map(([styleNo, data]) => ({
    styleNumber: styleNo,
    ...data,
  }));
};

const getSizeChartByStyleNumber = async (styleNumber) => {
  if (!styleNumber) return null;
  const cleanStyle = String(styleNumber).trim().split("-")[0];

  try {
    const charts = await prisma.$queryRaw`
      SELECT * FROM "SizeChart" 
      WHERE "styleNumber" = ${cleanStyle} 
         OR "applicableStyles"::jsonb ? ${cleanStyle}
      LIMIT 1
    `;
    if (charts && charts.length > 0) {
      return charts[0];
    }
  } catch (err) {
    console.warn("DB SizeChart query error:", err.message);
  }

  // Check static fallback map
  if (STATIC_CHARTS[cleanStyle]) {
    return {
      styleNumber: cleanStyle,
      ...STATIC_CHARTS[cleanStyle],
    };
  }

  return null;
};

const upsertSizeChart = async (payload) => {
  const { styleNumber, title, applicableStyles, sizes, measurements, unit = "cm", notes } = payload;
  if (!styleNumber || !sizes || !measurements) {
    throw new Error("styleNumber, sizes, and measurements are required.");
  }

  const cleanStyle = String(styleNumber).trim();
  const id = `sizechart-${cleanStyle}`;

  await prisma.$executeRawUnsafe(`
    INSERT INTO "SizeChart" ("id", "styleNumber", "title", "applicableStyles", "sizes", "measurements", "unit", "notes", "updatedAt")
    VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7, $8, CURRENT_TIMESTAMP)
    ON CONFLICT ("styleNumber") DO UPDATE SET
      "title" = EXCLUDED."title",
      "applicableStyles" = EXCLUDED."applicableStyles",
      "sizes" = EXCLUDED."sizes",
      "measurements" = EXCLUDED."measurements",
      "unit" = EXCLUDED."unit",
      "notes" = EXCLUDED."notes",
      "updatedAt" = CURRENT_TIMESTAMP;
  `, id, cleanStyle, title || `Size chart for Style #${cleanStyle}`, JSON.stringify(applicableStyles || [cleanStyle]), JSON.stringify(sizes), JSON.stringify(measurements), unit, notes || null);

  return getSizeChartByStyleNumber(cleanStyle);
};

module.exports = {
  getSizeCharts,
  getSizeChartByStyleNumber,
  upsertSizeChart,
  getSingleSizeMeasurements,
  SIZE_CHART_10105_10106_10116,
};
