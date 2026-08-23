const prisma = require("../src/config/db");

const invoiceItems = [
  { orderNo: "NP10002", article: "10101", qty: 651, desc: "T-Shirt", color: "Black", usd: 3.81 },
  { orderNo: "NP10002", article: "10102", qty: 635, desc: "Polo shirt", color: "Black", usd: 4.93 },
  { orderNo: "NP10002", article: "10125", qty: 400, desc: "T-Shirt", color: "Black", usd: 4.19 },
  { orderNo: "NP10002", article: "10126", qty: 400, desc: "Polo shirt", color: "Black", usd: 5.31 },
  { orderNo: "10117",   article: "10115", qty: 400, desc: "Apron", color: "Black", usd: 2.56 },
  { orderNo: "NP10002", article: "10115", qty: 190, desc: "Apron", color: "Black", usd: 2.56 },
  { orderNo: "NP10002", article: "10115", qty: 47,  desc: "Apron", color: "Light Grey", usd: 2.56 },
  { orderNo: "NP10004", article: "10115", qty: 925, desc: "Apron", color: "Black", usd: 2.56 },
  { orderNo: "NP10004", article: "10115", qty: 203, desc: "Apron", color: "Light Grey", usd: 2.56 },
  { orderNo: "NP10002", article: "10106", qty: 68,  desc: "Scrub", color: "White", usd: 7.36 },
  { orderNo: "NP10002", article: "10106", qty: 97,  desc: "Scrub", color: "Navy", usd: 8.26 },
  { orderNo: "NP10004", article: "10103", qty: 153, desc: "shirts", color: "White", usd: 8.86 },
  { orderNo: "NP10002", article: "10107", qty: 100, desc: "Scrub", color: "White", usd: 5.71 },
  { orderNo: "NP10002", article: "10107", qty: 96,  desc: "Scrub", color: "Navy", usd: 7.44 },
  { orderNo: "NP10002", article: "10108", qty: 63,  desc: "Trouser", color: "White", usd: 5.71 },
  { orderNo: "NP10002", article: "10108", qty: 89,  desc: "Trouser", color: "Navy", usd: 7.44 },
  { orderNo: "NP10002", article: "10108", qty: 58,  desc: "Trouser", color: "Grey", usd: 7.44 },
  { orderNo: "NP10002", article: "10105", qty: 147, desc: "Trouser", color: "Navy", usd: 7.63 },
  { orderNo: "NP10002", article: "10116", qty: 100, desc: "Trouser", color: "White", usd: 5.71 },
  { orderNo: "NP10002", article: "10106", qty: 59,  desc: "Scrub", color: "Grey", usd: 8.26 },
  { orderNo: "NP10002", article: "10105", qty: 122, desc: "Trouser", color: "White", usd: 7.63 },
  { orderNo: "NP10002", article: "10109", qty: 24,  desc: "Coat", color: "White", usd: 9.71 },
  { orderNo: "NP10002", article: "10113", qty: 21,  desc: "Chef hat", color: "White", usd: 2.78 },
  { orderNo: "NP10002", article: "10114", qty: 21,  desc: "Chef hat", color: "White", usd: 2.78 },
  { orderNo: "NP10003", article: "20110", qty: 701, desc: "Jackets", color: "White", usd: 9.72 },
  { orderNo: "NP10003", article: "20110", qty: 724, desc: "Jackets", color: "Black", usd: 11.02 },
  { orderNo: "NP10003", article: "20111", qty: 240, desc: "Jackets", color: "White", usd: 8.66 },
  { orderNo: "NP10003", article: "20111", qty: 233, desc: "Jackets", color: "Black", usd: 10.13 },
  { orderNo: "NP10003", article: "200120", qty: 49, desc: "Trousers", color: "White", usd: 8.36 },
  { orderNo: "NP10003", article: "200120", qty: 52, desc: "Trousers", color: "Black", usd: 10.13 },
  { orderNo: "NP10003", article: "200123", qty: 53, desc: "Trousers", color: "White", usd: 10.08 },
  { orderNo: "NP10003", article: "200123", qty: 48, desc: "Trousers", color: "Black", usd: 9.53 },
  { orderNo: "NP10003", article: "200126", qty: 50, desc: "Trousers", color: "Black", usd: 9.30 },
  { orderNo: "NP10003", article: "10115", qty: 206, desc: "Apron", color: "Black", usd: 2.56 },
  { orderNo: "NP10003", article: "200128", qty: 209, desc: "Apron", color: "Black", usd: 2.48 },
  { orderNo: "NP10003", article: "200127", qty: 49, desc: "Trousers", color: "Black", usd: 9.18 },
  { orderNo: "NP10003", article: "200121", qty: 52, desc: "Trouser", color: "Black/white papeta", usd: 12.00 },
  { orderNo: "NP10003", article: "200122", qty: 50, desc: "Trouser", color: "Black/white papeta", usd: 11.31 },
  { orderNo: "NP10003", article: "200124", qty: 52, desc: "Trouser", color: "Black/white papeta", usd: 11.22 },
  { orderNo: "NP10003", article: "200125", qty: 33, desc: "Trouser", color: "Black/white papeta", usd: 9.54 }
];

async function run() {
  console.log("=== INVOICE ITEMS & COST PRICE CALCULATIONS ===");
  const uniqueMap = new Map();
  for (const item of invoiceItems) {
    const key = item.article + "_" + item.color;
    if (!uniqueMap.has(key)) {
      const usd20 = item.usd * 1.20;
      const nokExact = usd20 * 10;
      const nok2Dec = Number(nokExact.toFixed(2));
      const nokRound = Math.round(nokExact);
      uniqueMap.set(key, { ...item, usd20, nokExact, nok2Dec, nokRound });
    }
  }

  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      sku: true,
      baseStyleNumber: true,
      styleNumber: true,
      productName: true,
      color: true,
      size: true,
      purchasePrice: true
    }
  });

  for (const [key, calc] of uniqueMap.entries()) {
    const matches = allProducts.filter(p => {
      const pBase = p.baseStyleNumber || (p.styleNumber ? p.styleNumber.split("-")[0] : p.sku.split("-")[0]);
      return pBase === calc.article;
    });
    const colors = [...new Set(matches.map(m => m.color))];
    console.log(`Article ${calc.article} (${calc.desc}, ${calc.color}): USD $${calc.usd.toFixed(2)} -> +20%: $${calc.usd20.toFixed(3)} -> NOK: kr ${calc.nok2Dec} (Int: kr ${calc.nokRound}) | DB colors: ${JSON.stringify(colors)}`);
  }
}

run().then(() => prisma.$disconnect()).catch(err => { console.error(err); prisma.$disconnect(); });
