const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const prisma = require("../src/config/db");

async function main() {
  const charts = await prisma.$queryRaw`
    SELECT * FROM "SizeChart" ORDER BY "styleNumber" ASC
  `;
  console.log("==========================================================================");
  console.log(`TOTAL SIZE CHARTS IN DATABASE: ${charts.length}`);
  console.log("==========================================================================");
  for (const c of charts) {
    const s = Array.isArray(c.sizes) ? c.sizes : JSON.parse(c.sizes || "[]");
    const m = Array.isArray(c.measurements) ? c.measurements : JSON.parse(c.measurements || "[]");
    console.log(`✓ Style #${String(c.styleNumber).padEnd(8)} | ${String(c.title).padEnd(45)} | ${String(s.length).padStart(2)} sizes | ${String(m.length).padStart(2)} rows`);
  }

  // Count products with sizeChart
  const prodRes = await prisma.$queryRaw`
    SELECT COUNT(*)::int as count FROM "Product" WHERE "sizeChart" IS NOT NULL
  `;
  console.log("==========================================================================");
  console.log(`TOTAL PRODUCT VARIANTS WITH EMBEDDED SIZE SPECS: ${prodRes[0]?.count}`);
  console.log("==========================================================================");
}

main().catch(console.error).finally(() => process.exit(0));
