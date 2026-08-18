const bwipjs = require("bwip-js");
const fs = require("fs");
const path = require("path");

async function generateBarcodeBase64(text, bcid = "code128") {
  const pngBuffer = await bwipjs.toBuffer({
    bcid: bcid,
    text: text,
    scale: 3,
    height: 12,
    includetext: true,
    textxalign: "center",
  });
  return `data:image/png;base64,${pngBuffer.toString("base64")}`;
}

async function generateQRCodeBase64(text) {
  const pngBuffer = await bwipjs.toBuffer({
    bcid: "qrcode",
    text: text,
    scale: 4,
    height: 25,
    width: 25,
  });
  return `data:image/png;base64,${pngBuffer.toString("base64")}`;
}

async function run() {
  const masterBarcodeValue = "CTN-NP10002-Z15-MIX";
  const masterBarcodeImg = await generateBarcodeBase64(masterBarcodeValue);

  // Mixed items inside this box
  const mixedItems = [
    {
      color: "Black",
      colorCode: "B",
      size: "S",
      sku: "10101-S-B",
      barcode: "IMG-2026-000105",
      qty: 6
    },
    {
      color: "Black",
      colorCode: "B",
      size: "M",
      sku: "10101-M-B",
      barcode: "IMG-2026-000104",
      qty: 12
    },
    {
      color: "Bright White",
      colorCode: "W",
      size: "M",
      sku: "10101-M-W",
      barcode: "IMG-2026-000303",
      qty: 8
    },
    {
      color: "Bright White",
      colorCode: "W",
      size: "L",
      sku: "10101-L-W",
      barcode: "IMG-2026-000304",
      qty: 5
    },
    {
      color: "Navy Blue",
      colorCode: "NB",
      size: "XL",
      sku: "10101-XL-NB",
      barcode: "IMG-2026-000312",
      qty: 7
    }
  ];

  // Generate barcodes for each item
  for (const item of mixedItems) {
    item.barcodeImg = await generateBarcodeBase64(item.barcode);
  }

  const qrData = JSON.stringify({
    carton: masterBarcodeValue,
    style: "10101",
    totalQty: mixedItems.reduce((acc, i) => acc + i.qty, 0),
    items: mixedItems.map(i => ({ sku: i.sku, barcode: i.barcode, qty: i.qty }))
  });
  const qrCodeImg = await generateQRCodeBase64(qrData);

  const totalPcs = mixedItems.reduce((acc, i) => acc + i.qty, 0);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mixed Carton Sticker Demo - Nordic Prowear</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      background: #f1f5f9;
      padding: 30px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .print-btn {
      margin-bottom: 20px;
      background: #0f172a;
      color: white;
      border: none;
      padding: 10px 24px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .sticker-container {
      width: 480px;
      background: white;
      border: 2px solid #0f172a;
      border-radius: 8px;
      padding: 18px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      box-sizing: border-box;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 0.5px;
      color: #0f172a;
      text-transform: uppercase;
    }
    .badge-mixed {
      background: #dc2626;
      color: white;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 12px;
      font-size: 12px;
      margin-bottom: 12px;
      background: #f8fafc;
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
    }
    .info-label {
      color: #64748b;
      font-weight: 600;
    }
    .info-value {
      color: #0f172a;
      font-weight: 700;
    }
    .master-barcode-section {
      text-align: center;
      background: #eff6ff;
      border: 1.5px dashed #3b82f6;
      border-radius: 6px;
      padding: 12px 8px;
      margin-bottom: 14px;
    }
    .master-title {
      font-size: 11px;
      font-weight: 800;
      color: #1d4ed8;
      text-transform: uppercase;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }
    .master-barcode-img {
      max-width: 100%;
      height: 50px;
      display: block;
      margin: 0 auto;
    }
    .breakdown-title {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 4px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
    }
    .item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .item-meta {
      flex: 1;
    }
    .item-color-size {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
    }
    .item-sku {
      font-size: 11px;
      color: #64748b;
      font-family: monospace;
    }
    .item-qty-badge {
      background: #0f172a;
      color: white;
      font-size: 12px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
      margin: 0 10px;
      white-space: nowrap;
    }
    .item-barcode-img {
      height: 34px;
      max-width: 140px;
    }
    .footer-section {
      margin-top: 14px;
      padding-top: 10px;
      border-top: 1.5px solid #0f172a;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-text {
      font-size: 10px;
      color: #64748b;
      line-height: 1.4;
    }
    .qr-img {
      width: 48px;
      height: 48px;
    }
    @media print {
      body { background: white; padding: 0; }
      .print-btn { display: none; }
      .sticker-container { border: 2px solid black; box-shadow: none; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Print Mixed Carton Sticker</button>
  
  <div class="sticker-container">
    <div class="header">
      <div>
        <div class="brand-title">NORDIC PROWEAR</div>
        <div style="font-size: 12px; color: #475569; font-weight: 600;">Garment Logistics & Warehousing</div>
      </div>
      <div class="badge-mixed">⚠️ LAST BOX (MIXED)</div>
    </div>

    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Order No:</span>
        <span class="info-value">NP10002</span>
      </div>
      <div class="info-row">
        <span class="info-label">Carton No:</span>
        <span class="info-value">Z15 (Mixed)</span>
      </div>
      <div class="info-row">
        <span class="info-label">Style No:</span>
        <span class="info-value">10101 (Sandefjord)</span>
      </div>
      <div class="info-row">
        <span class="info-label">Total Items:</span>
        <span class="info-value" style="color: #dc2626; font-size: 13px;">${totalPcs} PCS</span>
      </div>
    </div>

    <!-- MASTER CARTON BARCODE -->
    <div class="master-barcode-section">
      <div class="master-title">📦 MASTER CARTON BARCODE (SCAN FOR FULL INWARD)</div>
      <img class="master-barcode-img" src="${masterBarcodeImg}" alt="Master Barcode" />
    </div>

    <!-- BREAKDOWN TABLE -->
    <div class="breakdown-title">
      <span>Color & Size Breakdown</span>
      <span>Unit Barcode</span>
    </div>

    ${mixedItems.map(item => `
      <div class="item-row">
        <div class="item-meta">
          <div class="item-color-size">${item.color} • Size ${item.size}</div>
          <div class="item-sku">${item.sku}</div>
        </div>
        <div class="item-qty-badge">${item.qty} pcs</div>
        <img class="item-barcode-img" src="${item.barcodeImg}" alt="${item.barcode}" />
      </div>
    `).join("")}

    <div class="footer-section">
      <div class="footer-text">
        <strong>Official Nordic Prowear ERP Packing Label</strong><br>
        Scan master code or individual size codes during inventory receiving.
      </div>
      <img class="qr-img" src="${qrCodeImg}" alt="QR Manifest" />
    </div>
  </div>
</body>
</html>`;

  const outputPath = path.join(__dirname, "../../client/public/mixed-carton-sticker-demo.html");
  fs.writeFileSync(outputPath, html);
  console.log(`Demo sticker HTML generated successfully at: ${outputPath}`);
}

run().catch(console.error);
