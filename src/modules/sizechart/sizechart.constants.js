// Standardized Size Chart Data Definitions for all Nordic Prowear styles

const normalizeSizeKey = (sizeStr) => {
  if (!sizeStr) return null;
  const s = String(sizeStr).trim().toUpperCase();
  if (s === "XS" || s === "X-SMALL" || s === "EXTRA SMALL") return "XS";
  if (s === "S" || s === "SMALL") return "S";
  if (s === "M" || s === "MEDIUM" || s === "MED") return "M";
  if (s === "L" || s === "LARGE") return "L";
  if (s === "XL" || s === "X-LARGE" || s === "EXTRA LARGE") return "XL";
  if (s === "2XL" || s === "XXL" || s === "2X-LARGE" || s === "DOUBLE XL") return "2XL";
  if (s === "3XL" || s === "3X-LARGE") return "3XL";
  if (s === "4XL" || s === "4X-LARGE") return "4XL";
  if (s === "5XL" || s === "5X-LARGE") return "5XL";
  if (s === "6XL" || s === "6X-LARGE") return "6XL";
  return s;
};

const getSingleSizeMeasurements = (sizeKey, chart) => {
  if (!chart || !chart.sizes || !chart.measurements) return null;
  const normalizedKey = normalizeSizeKey(sizeKey);
  const sizeMeta = chart.sizes.find(
    (s) =>
      s.key.toUpperCase() === String(sizeKey).toUpperCase() ||
      s.key.toUpperCase() === normalizedKey ||
      s.label.toUpperCase().includes(String(sizeKey).toUpperCase())
  ) || chart.sizes[0];

  const breakdown = {};
  chart.measurements.forEach((m) => {
    breakdown[m.code] = {
      name: m.name,
      norwegianName: m.norwegianName,
      value: m.values[sizeMeta?.key] || m.values[normalizedKey] || m.values[sizeKey] || "—",
      tolerance: m.tolerance,
    };
  });

  return {
    size: sizeMeta ? sizeMeta.label : sizeKey,
    sizeKey: sizeMeta ? sizeMeta.key : normalizedKey || sizeKey,
    colorBadge: sizeMeta?.colorBadge || "standard",
    colorHex: sizeMeta?.colorHex || "#3b82f6",
    unit: chart.unit || "cm",
    measurements: breakdown,
  };
};

// 1. Article 10101 (Sandefjord / BASIC S/S TEE)
const SIZE_CHART_10101 = {
  title: "Size Chart for Article 10101 (Sandefjord / BASIC S/S TEE)",
  applicableStyles: ["10101"],
  unit: "cm",
  sizes: [
    { key: "XXS", label: "XXS", colorBadge: "light grey", colorHex: "#cbd5e1", textHex: "#0f172a", bgLight: "#f8fafc", border: "#cbd5e1" },
    { key: "XS", label: "XS", colorBadge: "yellow", colorHex: "#eab308", textHex: "#0f172a", bgLight: "#fef9c3", border: "#fde047" },
    { key: "S", label: "S", colorBadge: "green", colorHex: "#22c55e", textHex: "#0f172a", bgLight: "#dcfce7", border: "#86efac" },
    { key: "M", label: "M", colorBadge: "medium blue", colorHex: "#3b82f6", textHex: "#0f172a", bgLight: "#dbeafe", border: "#93c5fd" },
    { key: "L", label: "L", colorBadge: "red", colorHex: "#ef4444", textHex: "#0f172a", bgLight: "#fee2e2", border: "#fca5a5" },
    { key: "XL", label: "XL", colorBadge: "black", colorHex: "#1e293b", textHex: "#ffffff", bgLight: "#f1f5f9", border: "#cbd5e1" },
    { key: "2XL", label: "2XL (XXL)", colorBadge: "violet", colorHex: "#8b5cf6", textHex: "#ffffff", bgLight: "#ede9fe", border: "#c4b5fd" },
    { key: "3XL", label: "3XL", colorBadge: "brown", colorHex: "#78350f", textHex: "#ffffff", bgLight: "#fef3c7", border: "#d97706" }
  ],
  measurements: [
    {
      code: "A",
      name: "Length back, HPS",
      norwegianName: "Rygglengde fra HPS",
      tolerance: "± 1",
      values: { XXS: "66", XS: "67.5", S: "70", M: "72", L: "74", XL: "75.5", "2XL": "77", XXL: "77", "3XL": "78.5" }
    },
    {
      code: "B",
      name: "1/2 Chest",
      norwegianName: "½ Brystvidde",
      tolerance: "± 1",
      values: { XXS: "45", XS: "48", S: "51", M: "54", L: "57", XL: "60", "2XL": "63", XXL: "63", "3XL": "66" }
    },
    {
      code: "C",
      name: "1/2 Waist",
      norwegianName: "½ Midjevidde",
      tolerance: "± 1",
      values: { XXS: "44", XS: "47", S: "50", M: "53", L: "56", XL: "59", "2XL": "62", XXL: "62", "3XL": "65" }
    },
    {
      code: "D",
      name: "1/2 Bottom",
      norwegianName: "½ Bunnvidde",
      tolerance: "± 1",
      values: { XXS: "44", XS: "47", S: "50", M: "53", L: "56", XL: "59", "2XL": "62", XXL: "62", "3XL": "65" }
    },
    {
      code: "E",
      name: "Across shoulder",
      norwegianName: "Skuldervidde",
      tolerance: "± 1",
      values: { XXS: "46.5", XS: "48.5", S: "50.5", M: "52.5", L: "54.5", XL: "56.5", "2XL": "58.5", XXL: "58.5", "3XL": "60.5" }
    },
    {
      code: "F",
      name: "Front width at 1/2 armhole",
      norwegianName: "Frontvidde ved ½ ermehull",
      tolerance: "± 1",
      values: { XXS: "39.5", XS: "41.5", S: "43.5", M: "45.5", L: "47.5", XL: "49.5", "2XL": "51.5", XXL: "51.5", "3XL": "53.5" }
    },
    {
      code: "G",
      name: "Back width at 1/2 armhole",
      norwegianName: "Ryggbredde ved ½ ermehull",
      tolerance: "± 1",
      values: { XXS: "41", XS: "43", S: "45", M: "47", L: "49", XL: "51", "2XL": "53", XXL: "53", "3XL": "55" }
    },
    {
      code: "H",
      name: "1/2 Neck width inside piping",
      norwegianName: "½ Halsvidde innside kanting",
      tolerance: "± 0.5",
      values: { XXS: "15.5", XS: "16", S: "16.5", M: "17", L: "17.5", XL: "18", "2XL": "18.5", XXL: "18.5", "3XL": "19" }
    },
    {
      code: "I",
      name: "Front neckdrop outside piping",
      norwegianName: "Halsdybde foran utside kanting",
      tolerance: "± 0.5",
      values: { XXS: "9.5", XS: "9.5", S: "10", M: "10.5", L: "11", XL: "11.5", "2XL": "12", XXL: "12", "3XL": "12.5" }
    },
    {
      code: "J",
      name: "Back neckdrop",
      norwegianName: "Halsdybde bak",
      tolerance: "± 0.2",
      values: { XXS: "2.5", XS: "2.5", S: "2.5", M: "2.5", L: "2.5", XL: "2.5", "2XL": "2.5", XXL: "2.5", "3XL": "2.5" }
    },
    {
      code: "K",
      name: "Piping width",
      norwegianName: "Kanting bredde",
      tolerance: "—",
      values: { XXS: "2", XS: "2", S: "2", M: "2", L: "2", XL: "2", "2XL": "2", XXL: "2", "3XL": "2" }
    },
    {
      code: "L",
      name: "Armhole depth fr. HPS",
      norwegianName: "Ermehulldybde fra HPS",
      tolerance: "± 1",
      values: { XXS: "25", XS: "26", S: "27", M: "28", L: "29", XL: "30", "2XL": "31", XXL: "31", "3XL": "32" }
    },
    {
      code: "M",
      name: "Sleeve length",
      norwegianName: "Ermelengde",
      tolerance: "± 1",
      values: { XXS: "17", XS: "18", S: "19", M: "20", L: "21", XL: "22", "2XL": "23", XXL: "23", "3XL": "24" }
    },
    {
      code: "N",
      name: "Under sleeve (Revised)",
      norwegianName: "Underside erme",
      tolerance: "± 0.5",
      values: { XXS: "10.5", XS: "11.0", S: "11.5", M: "12.0", L: "12.5", XL: "13.0", "2XL": "13.5", XXL: "13.5", "3XL": "14.0" }
    },
    {
      code: "O",
      name: "1/2 Biceps 2 cm below a.h.",
      norwegianName: "½ Overarm 2 cm under ermehull",
      tolerance: "± 0.5",
      values: { XXS: "19", XS: "20", S: "21", M: "22", L: "23", XL: "24", "2XL": "25", XXL: "25", "3XL": "26" }
    },
    {
      code: "P",
      name: "1/2 Sleeve opening",
      norwegianName: "½ Ermeåpning",
      tolerance: "± 0.5",
      values: { XXS: "15", XS: "16", S: "17", M: "18", L: "19", XL: "20", "2XL": "21", XXL: "21", "3XL": "22" }
    },
    {
      code: "Q",
      name: "Hem height",
      norwegianName: "Oppfaldfaldhøyde",
      tolerance: "—",
      values: { XXS: "2", XS: "2", S: "2", M: "2", L: "2", XL: "2", "2XL": "2", XXL: "2", "3XL": "2" }
    },
    {
      code: "R",
      name: "Shoulder slope",
      norwegianName: "Skulderhelning",
      tolerance: "—",
      values: { XXS: "4.7", XS: "4.7", S: "4.7", M: "4.7", L: "4.7", XL: "4.7", "2XL": "4.7", XXL: "4.7", "3XL": "4.7" }
    },
    {
      code: "CAP",
      name: "Resulting Cap Height",
      norwegianName: "Kuppelhøyde erme",
      tolerance: "± 0.5",
      values: { XXS: "6.5", XS: "7.0", S: "7.5", M: "8.0", L: "8.5", XL: "9.0", "2XL": "9.5", XXL: "9.5", "3XL": "10.0" }
    }
  ]
};

// 2. Article 10102 (Tønsberg Polo Shirt)
const SIZE_CHART_10102 = {
  title: "Size Chart for Article 10102 (Tønsberg Polo Shirt)",
  applicableStyles: ["10102"],
  unit: "cm",
  sizes: [
    { key: "XXS", label: "XXS", colorBadge: "light grey", colorHex: "#cbd5e1", textHex: "#0f172a", bgLight: "#f8fafc", border: "#cbd5e1" },
    { key: "XS", label: "XS", colorBadge: "yellow", colorHex: "#eab308", textHex: "#0f172a", bgLight: "#fef9c3", border: "#fde047" },
    { key: "S", label: "S", colorBadge: "green", colorHex: "#22c55e", textHex: "#0f172a", bgLight: "#dcfce7", border: "#86efac" },
    { key: "M", label: "M", colorBadge: "medium blue", colorHex: "#3b82f6", textHex: "#0f172a", bgLight: "#dbeafe", border: "#93c5fd" },
    { key: "L", label: "L", colorBadge: "red", colorHex: "#ef4444", textHex: "#0f172a", bgLight: "#fee2e2", border: "#fca5a5" },
    { key: "XL", label: "XL", colorBadge: "black", colorHex: "#1e293b", textHex: "#ffffff", bgLight: "#f1f5f9", border: "#cbd5e1" },
    { key: "2XL", label: "2XL (XXL)", colorBadge: "violet", colorHex: "#8b5cf6", textHex: "#ffffff", bgLight: "#ede9fe", border: "#c4b5fd" },
    { key: "3XL", label: "3XL", colorBadge: "brown", colorHex: "#78350f", textHex: "#ffffff", bgLight: "#fef3c7", border: "#d97706" },
    { key: "4XL", label: "4XL", colorBadge: "orange", colorHex: "#ea580c", textHex: "#ffffff", bgLight: "#ffedd5", border: "#fb923c" }
  ],
  measurements: [
    {
      code: "A",
      name: "Chest",
      norwegianName: "Brystvidde",
      tolerance: "± 1.0",
      values: { XXS: "86", XS: "92", S: "98", M: "104", L: "110", XL: "116", "2XL": "122", XXL: "122", "3XL": "128", "4XL": "134" }
    },
    {
      code: "B",
      name: "Bottom",
      norwegianName: "Bunnvidde",
      tolerance: "± 1.0",
      values: { XXS: "83", XS: "89", S: "95", M: "101", L: "107", XL: "113", "2XL": "119", XXL: "119", "3XL": "125", "4XL": "131" }
    },
    {
      code: "C",
      name: "Sleeve length from shoulder",
      norwegianName: "Ermelengde fra skulder",
      tolerance: "± 0.5",
      values: { XXS: "19.5", XS: "20.5", S: "21.5", M: "22.5", L: "23.5", XL: "24.5", "2XL": "25.5", XXL: "25.5", "3XL": "26.5", "4XL": "27.5" }
    },
    {
      code: "D",
      name: "Scye depth from HPS",
      norwegianName: "Ermehulldybde fra HPS",
      tolerance: "± 0.5",
      values: { XXS: "24.5", XS: "25.5", S: "26.5", M: "27.5", L: "28.5", XL: "29.5", "2XL": "30.5", XXL: "30.5", "3XL": "31.5", "4XL": "32.5" }
    },
    {
      code: "E",
      name: "Back length from HPS",
      norwegianName: "Rygglengde fra HPS",
      tolerance: "± 1.0",
      values: { XXS: "67", XS: "69", S: "71", M: "73", L: "75", XL: "77", "2XL": "79", XXL: "79", "3XL": "81", "4XL": "83" }
    },
    {
      code: "F",
      name: "Shoulder to shoulder",
      norwegianName: "Skulderbredde",
      tolerance: "± 0.5",
      values: { XXS: "41.0", XS: "42.5", S: "44.0", M: "45.5", L: "47.0", XL: "48.5", "2XL": "50.0", XXL: "50.0", "3XL": "51.5", "4XL": "53.0" }
    },
    {
      code: "G",
      name: "Bicep",
      norwegianName: "Overarm (Bicep)",
      tolerance: "± 0.5",
      values: { XXS: "35", XS: "37", S: "39", M: "41", L: "43", XL: "45", "2XL": "47", XXL: "47", "3XL": "49", "4XL": "51" }
    },
    {
      code: "H",
      name: "Sleeve opening",
      norwegianName: "Ermeåpning",
      tolerance: "± 0.5",
      values: { XXS: "26", XS: "28", S: "30", M: "32", L: "34", XL: "36", "2XL": "38", XXL: "38", "3XL": "40", "4XL": "42" }
    },
    {
      code: "I",
      name: "Collar point",
      norwegianName: "Kragespiss",
      tolerance: "—",
      values: { XXS: "5.0", XS: "5.0", S: "5.0", M: "5.5", L: "5.5", XL: "5.5", "2XL": "5.5", XXL: "5.5", "3XL": "6.0", "4XL": "6.0" }
    },
    {
      code: "J",
      name: "Placket",
      norwegianName: "Knappestolpe (Placket)",
      tolerance: "—",
      values: { XXS: "3.5/15", XS: "3.5/15", S: "3.5/15", M: "3.5/15.5", L: "3.5/15.5", XL: "3.5/15.5", "2XL": "3.5/16", XXL: "3.5/16", "3XL": "3.5/16", "4XL": "3.5/16" }
    },
    {
      code: "K",
      name: "Neck drop front from HPS",
      norwegianName: "Halsdybde foran fra HPS",
      tolerance: "± 0.25",
      values: { XXS: "7.75", XS: "8.0", S: "8.25", M: "8.5", L: "8.75", XL: "9.0", "2XL": "9.25", XXL: "9.25", "3XL": "9.5", "4XL": "9.75" }
    },
    {
      code: "L",
      name: "Back neck drop",
      norwegianName: "Halsdybde bak",
      tolerance: "± 0.2",
      values: { XXS: "2.0", XS: "2.0", S: "2.0", M: "2.0", L: "2.0", XL: "2.0", "2XL": "2.0", XXL: "2.0", "3XL": "2.0", "4XL": "2.0" }
    },
    {
      code: "M",
      name: "Neck width, seam to seam",
      norwegianName: "Halsvidde søm til søm",
      tolerance: "± 0.5",
      values: { XXS: "19.0", XS: "19.5", S: "20.0", M: "20.5", L: "21.0", XL: "21.5", "2XL": "22.0", XXL: "22.0", "3XL": "22.5", "4XL": "23.0" }
    },
    {
      code: "N",
      name: "Collar length, button middle to middle",
      norwegianName: "Kragelengde knapp midt til midt",
      tolerance: "± 0.5",
      values: { XXS: "39", XS: "41", S: "43", M: "45", L: "47", XL: "49", "2XL": "51", XXL: "51", "3XL": "53", "4XL": "55" }
    }
  ]
};

// 3. Articles 10105, 10106, 10116 (Lillehammer, Stavanger, Hamar Scrubs)
const SIZE_CHART_10105_10106_10116 = {
  title: "Size chart for article 10105, 10106 and 10116",
  applicableStyles: ["10105", "10106", "10116"],
  unit: "cm",
  sizes: [
    { key: "XS", label: "X-SMALL", colorBadge: "yellow", colorHex: "#eab308", textHex: "#854d0e", bgLight: "#fef9c3", border: "#fde047" },
    { key: "S", label: "SMALL", colorBadge: "green", colorHex: "#22c55e", textHex: "#14532d", bgLight: "#dcfce7", border: "#86efac" },
    { key: "M", label: "MEDIUM", colorBadge: "medium blue", colorHex: "#3b82f6", textHex: "#1e3a8a", bgLight: "#dbeafe", border: "#93c5fd" },
    { key: "L", label: "LARGE", colorBadge: "red", colorHex: "#ef4444", textHex: "#7f1d1d", bgLight: "#fee2e2", border: "#fca5a5" },
    { key: "XL", label: "X-LARGE", colorBadge: "black", colorHex: "#1e293b", textHex: "#ffffff", bgLight: "#f1f5f9", border: "#cbd5e1" },
    { key: "2XL", label: "2X-LARGE", colorBadge: "violet", colorHex: "#8b5cf6", textHex: "#ffffff", bgLight: "#ede9fe", border: "#c4b5fd" }
  ],
  measurements: [
    { code: "A", name: "Chest Width", norwegianName: "Brystvidde", tolerance: "± 1", values: { XS: "54.5", S: "56.5", M: "59", L: "61.5", XL: "64", "2XL": "66.5" } },
    { code: "B", name: "Width down", norwegianName: "Bunnvidde", tolerance: "± 1", values: { XS: "56.5", S: "58.5", M: "61.5", L: "64.5", XL: "67.5", "2XL": "70.5" } },
    { code: "C", name: "Height neck opening at the back", norwegianName: "Halsåpning høyde bak", tolerance: "± 0.5", values: { XS: "3", S: "3", M: "3", L: "3", XL: "3", "2XL": "3" } },
    { code: "D", name: "Height v-neck-opening at the front", norwegianName: "V-hals åpning foran", tolerance: "± 0.75", values: { XS: "14", S: "15", M: "16", L: "16.5", XL: "17", "2XL": "17.5" } },
    { code: "E", name: "Back length from neck opening", norwegianName: "Rygglengde fra hals", tolerance: "± 1", values: { XS: "74", S: "75", M: "77", L: "79", XL: "80", "2XL": "81" } },
    { code: "F", name: "Sleeve length from neck opening", norwegianName: "Ermelengde fra hals", tolerance: "± 1", values: { XS: "42", S: "44", M: "46", L: "48", XL: "50", "2XL": "52" } },
    { code: "G", name: "Width neckopening", norwegianName: "Halsvidde", tolerance: "± 0.75", values: { XS: "16", S: "16.5", M: "17", L: "17.5", XL: "18", "2XL": "18.5" } },
    { code: "H", name: "Sleeve Width", norwegianName: "Ermevidde", tolerance: "± 0.5", values: { XS: "20", S: "21", M: "22", L: "23", XL: "23.5", "2XL": "24.5" } },
    { code: "I", name: "Distance chest pocket from side seam", norwegianName: "Avstand brystlomme fra sidesøm", tolerance: "—", values: { XS: "approx. 7", S: "approx. 8", M: "approx. 9", L: "approx. 10", XL: "approx. 11", "2XL": "approx. 12" } }
  ]
};

// 4. Articles 10107, 10108 (Hamar, Bergen Healthcare Bukse)
const SIZE_CHART_10107_10108 = {
  title: "Size chart for article 10107 and 10108",
  applicableStyles: ["10107", "10108"],
  unit: "cm",
  sizes: [
    { key: "2XS", label: "2X-SMALL", colorBadge: "light grey", colorHex: "#cbd5e1", textHex: "#0f172a", bgLight: "#f8fafc", border: "#cbd5e1" },
    { key: "XS", label: "X-SMALL", colorBadge: "yellow", colorHex: "#eab308", textHex: "#0f172a", bgLight: "#fef9c3", border: "#fde047" },
    { key: "S", label: "SMALL", colorBadge: "green", colorHex: "#22c55e", textHex: "#0f172a", bgLight: "#dcfce7", border: "#86efac" },
    { key: "M", label: "MEDIUM", colorBadge: "medium blue", colorHex: "#3b82f6", textHex: "#0f172a", bgLight: "#dbeafe", border: "#93c5fd" },
    { key: "L", label: "LARGE", colorBadge: "red", colorHex: "#ef4444", textHex: "#0f172a", bgLight: "#fee2e2", border: "#fca5a5" },
    { key: "XL", label: "X-LARGE", colorBadge: "black", colorHex: "#1e293b", textHex: "#ffffff", bgLight: "#f1f5f9", border: "#cbd5e1" },
    { key: "2XL", label: "2X-LARGE", colorBadge: "violet", colorHex: "#8b5cf6", textHex: "#ffffff", bgLight: "#ede9fe", border: "#c4b5fd" },
    { key: "3XL", label: "3XL (64/66)", colorBadge: "brown", colorHex: "#78350f", textHex: "#ffffff", bgLight: "#fef3c7", border: "#d97706" },
    { key: "4XL", label: "4XL (68/70)", colorBadge: "orange", colorHex: "#ea580c", textHex: "#ffffff", bgLight: "#ffedd5", border: "#fb923c" },
    { key: "5XL", label: "5XL (72/74)", colorBadge: "turquoise", colorHex: "#06b6d4", textHex: "#ffffff", bgLight: "#cffafe", border: "#67e8f9" },
    { key: "6XL", label: "6X-LARGE", colorBadge: "light grey", colorHex: "#94a3b8", textHex: "#ffffff", bgLight: "#f1f5f9", border: "#94a3b8" }
  ],
  measurements: [
    { code: "ELASTIC", name: "Elastic in half waistband at back, cut length", norwegianName: "Strikk i halv linning bak, klippelengde", tolerance: "± 1", values: { "2XS": "—", XS: "—", S: "—", M: "—", L: "—", XL: "—", "2XL": "—", "3XL": "—", "4XL": "—", "5XL": "—", "6XL": "—" } },
    { code: "A", name: "Waist circumference without elastic", norwegianName: "Midjevidde uten strikk", tolerance: "± 2", values: { "2XS": "86", XS: "90", S: "94", M: "102", L: "110", XL: "122", "2XL": "130", "3XL": "146", "4XL": "158", "5XL": "167", "6XL": "176" } },
    { code: "B", name: "Hip width", norwegianName: "Hoftevidde", tolerance: "± 2", values: { "2XS": "99", XS: "102", S: "105", M: "111", L: "118", XL: "130", "2XL": "142", "3XL": "149", "4XL": "158", "5XL": "167", "6XL": "176" } },
    { code: "C", name: "Stride length inner", norwegianName: "Innside benlengde", tolerance: "± 2", values: { "2XS": "77", XS: "79", S: "82", M: "86", L: "89", XL: "90", "2XL": "90", "3XL": "92", "4XL": "92", "5XL": "92", "6XL": "92" } },
    { code: "D", name: "Thigh width / Lårvidde", norwegianName: "Lårvidde", tolerance: "± 2", values: { "2XS": "60", XS: "65", S: "69", M: "72", L: "76", XL: "80", "2XL": "84", "3XL": "93", "4XL": "97", "5XL": "105", "6XL": "109" } },
    { code: "E", name: "Foot width with extended rib", norwegianName: "Fotvidde med utstrakt ribb", tolerance: "± 1", values: { "2XS": "39", XS: "39", S: "41", M: "41", L: "41", XL: "43", "2XL": "43", "3XL": "50", "4XL": "51", "5XL": "51", "6XL": "51" } },
    { code: "F1", name: "Front waist height (excl. waistband)", norwegianName: "Livhøyde foran (ekskl. linning)", tolerance: "± 1", values: { "2XS": "21", XS: "24", S: "27", M: "29", L: "33", XL: "33", "2XL": "33", "3XL": "35", "4XL": "35", "5XL": "35", "6XL": "35" } },
    { code: "F2", name: "Waist height at the back (excl. waistband)", norwegianName: "Livhøyde bak (ekskl. linning)", tolerance: "± 1", values: { "2XS": "33", XS: "36", S: "40", M: "42", L: "46", XL: "46", "2XL": "47", "3XL": "48", "4XL": "48", "5XL": "51", "6XL": "54" } },
    { code: "G", name: "Position back pocket to side seam", norwegianName: "Plassering baklomme til sidesøm", tolerance: "± 1", values: { "2XS": "2", XS: "3", S: "4", M: "4", L: "5", XL: "6", "2XL": "7", "3XL": "7", "4XL": "8", "5XL": "9", "6XL": "10" } },
    { code: "H", name: "Breadth of running gait in waist", norwegianName: "Bredde på løpegang i midje", tolerance: "± 1", values: { "2XS": "3", XS: "3", S: "3", M: "3", L: "3", XL: "3", "2XL": "3", "3XL": "3", "4XL": "3", "5XL": "3", "6XL": "3" } },
    { code: "TAG", name: "Distance from waistband to tag", norwegianName: "Avstand fra linning til merke", tolerance: "± 1", values: { "2XS": "5", XS: "5", S: "5", M: "5", L: "5", XL: "5", "2XL": "5", "3XL": "5", "4XL": "5", "5XL": "5", "6XL": "5" } },
    { code: "LEG", name: "Width of the leg running gait", norwegianName: "Bredde på løpegang i ben", tolerance: "—", values: { "2XS": "3", XS: "3", S: "3", M: "3", L: "3", XL: "3", "2XL": "3", "3XL": "3", "4XL": "3", "5XL": "3", "6XL": "3" } },
    { code: "K", name: "Position back pocket to top edge", norwegianName: "Plassering baklomme til toppkant", tolerance: "—", values: { "2XS": "10", XS: "10", S: "10", M: "10", L: "10", XL: "10", "2XL": "10", "3XL": "10", "4XL": "10", "5XL": "10", "6XL": "10" } },
    { code: "L", name: "Length", norwegianName: "Totallengde", tolerance: "± 1", values: { "2XS": "96", XS: "100.5", S: "105.5", M: "109.5", L: "115.5", XL: "117.5", "2XL": "118.5", "3XL": "120", "4XL": "120", "5XL": "121", "6XL": "121" } }
  ]
};

// 5. Article 10109 (Ålesund Coat)
const SIZE_CHART_10109 = {
  title: "Size Card for Article 10109 — Standard Measurements (in cm)",
  applicableStyles: ["10109"],
  unit: "cm",
  sizes: [
    { key: "40/42", label: "40/42", colorBadge: "navy", colorHex: "#1e3a8a", textHex: "#0f172a", bgLight: "#eff6ff", border: "#bfdbfe" },
    { key: "44/46", label: "44/46", colorBadge: "blue", colorHex: "#2563eb", textHex: "#0f172a", bgLight: "#dbeafe", border: "#93c5fd" },
    { key: "48/50", label: "48/50", colorBadge: "sky blue", colorHex: "#0284c7", textHex: "#0f172a", bgLight: "#e0f2fe", border: "#7dd3fc" },
    { key: "52/54", label: "52/54", colorBadge: "teal", colorHex: "#0d9488", textHex: "#0f172a", bgLight: "#ccfbf1", border: "#5eead4" },
    { key: "56/58", label: "56/58", colorBadge: "green", colorHex: "#16a34a", textHex: "#0f172a", bgLight: "#dcfce7", border: "#86efac" },
    { key: "60/62", label: "60/62", colorBadge: "amber", colorHex: "#d97706", textHex: "#0f172a", bgLight: "#fef3c7", border: "#fcd34d" },
    { key: "64/66", label: "64/66", colorBadge: "orange", colorHex: "#ea580c", textHex: "#0f172a", bgLight: "#ffedd5", border: "#fdba74" },
    { key: "68/70", label: "68/70", colorBadge: "red", colorHex: "#dc2626", textHex: "#0f172a", bgLight: "#fee2e2", border: "#fca5a5" },
    { key: "72/74", label: "72/74", colorBadge: "burgundy", colorHex: "#991b1b", textHex: "#0f172a", bgLight: "#ffe4e6", border: "#fda4af" },
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
    { code: "1", name: "Chest Circumference (Brustumfang)", norwegianName: "Brystomkrets (Brustumfang)", tolerance: "± 2", values: { "40/42": "106", "44/46": "114", "48/50": "122", "52/54": "130", "56/58": "138", "60/62": "146", "64/66": "154", "68/70": "162", "72/74": "170", "82/86": "106", "90/94": "114", "98/102": "122", "106/110": "130", "114/118": "138", "122/126": "146", "130/134": "154", "138/142": "162", "146/150": "170" } },
    { code: "4", name: "Sleeve Length (Ärmellänge)", norwegianName: "Ermelengde (Ärmellänge)", tolerance: "± 1", values: { "40/42": "58", "44/46": "63", "48/50": "65", "52/54": "66", "56/58": "67", "60/62": "68", "64/66": "69", "68/70": "70", "72/74": "70", "82/86": "65", "90/94": "67", "98/102": "69", "106/110": "70", "114/118": "71", "122/126": "72", "130/134": "73", "138/142": "74", "146/150": "74" } },
    { code: "5", name: "Back Length (Rückenlänge)", norwegianName: "Rygglengde (Rückenlänge)", tolerance: "± 1", values: { "40/42": "92", "44/46": "94", "48/50": "96", "52/54": "98", "56/58": "102", "60/62": "104", "64/66": "105", "68/70": "106", "72/74": "107", "82/86": "97", "90/94": "99", "98/102": "101", "106/110": "103", "114/118": "107", "122/126": "109", "130/134": "110", "138/142": "111", "146/150": "112" } },
    { code: "7", name: "Hem / Bottom Width (Saumbreite)", norwegianName: "Bunnvidde / Faldvidde (Saumbreite)", tolerance: "± 2", values: { "40/42": "110", "44/46": "118", "48/50": "126", "52/54": "136", "56/58": "146", "60/62": "156", "64/66": "166", "68/70": "176", "72/74": "186", "82/86": "110", "90/94": "118", "98/102": "126", "106/110": "136", "114/118": "146", "122/126": "156", "130/134": "166", "138/142": "176", "146/150": "186" } }
  ]
};

// 6. Article 10122 (Kalmar Fleece Jakke)
const SIZE_CHART_10122 = {
  title: "Size Chart for Article 10122 (Kalmar)",
  applicableStyles: ["10122"],
  unit: "cm",
  sizes: [
    { key: "XXS", label: "XXS", colorBadge: "light grey", colorHex: "#cbd5e1", textHex: "#0f172a", bgLight: "#f8fafc", border: "#cbd5e1" },
    { key: "XS", label: "XS (42)", colorBadge: "yellow", colorHex: "#eab308", textHex: "#0f172a", bgLight: "#fef9c3", border: "#fde047" },
    { key: "S", label: "S (46)", colorBadge: "green", colorHex: "#22c55e", textHex: "#0f172a", bgLight: "#dcfce7", border: "#86efac" },
    { key: "M", label: "M (50)", colorBadge: "medium blue", colorHex: "#3b82f6", textHex: "#0f172a", bgLight: "#dbeafe", border: "#93c5fd" },
    { key: "L", label: "L (54)", colorBadge: "red", colorHex: "#ef4444", textHex: "#0f172a", bgLight: "#fee2e2", border: "#fca5a5" },
    { key: "XL", label: "XL (58)", colorBadge: "black", colorHex: "#1e293b", textHex: "#ffffff", bgLight: "#f1f5f9", border: "#cbd5e1" },
    { key: "2XL", label: "2XL (62)", colorBadge: "violet", colorHex: "#8b5cf6", textHex: "#ffffff", bgLight: "#ede9fe", border: "#c4b5fd" },
    { key: "3XL", label: "3XL (66)", colorBadge: "brown", colorHex: "#78350f", textHex: "#ffffff", bgLight: "#fef3c7", border: "#d97706" },
    { key: "4XL", label: "4XL (70)", colorBadge: "orange", colorHex: "#ea580c", textHex: "#ffffff", bgLight: "#ffedd5", border: "#fb923c" }
  ],
  measurements: [
    {
      code: "1",
      name: "Half chest",
      norwegianName: "½ Brystvidde",
      tolerance: "± 1.0",
      values: {
        XXS: "47.0", XS: "50.0", "42": "50.0", S: "53.0", "46": "53.0",
        M: "56.0", "50": "56.0", "50 M": "56.0",
        L: "59.0", "54": "59.0", "54 L": "59.0",
        XL: "62.0", "58": "62.0", "58 XL": "62.0",
        "2XL": "65.0", "62": "65.0", "62 2XL": "65.0",
        "3XL": "68.0", "66": "68.0", "66 3XL": "68.0",
        "4XL": "71.0", "70": "71.0"
      }
    },
    {
      code: "2",
      name: "Half bottom",
      norwegianName: "½ Bunnvidde",
      tolerance: "± 1.0",
      values: {
        XXS: "44.0", XS: "47.0", "42": "47.0", S: "50.0", "46": "50.0",
        M: "53.0", "50": "53.0", "50 M": "53.0",
        L: "56.0", "54": "56.0", "54 L": "56.0",
        XL: "59.0", "58": "59.0", "58 XL": "59.0",
        "2XL": "62.0", "62": "62.0", "62 2XL": "62.0",
        "3XL": "65.0", "66": "65.0", "66 3XL": "65.0",
        "4XL": "68.0", "70": "68.0"
      }
    },
    {
      code: "3",
      name: "Shoulder width",
      norwegianName: "Skulderbredde",
      tolerance: "± 0.5",
      values: {
        XXS: "14.0", XS: "14.5", "42": "14.5", S: "15.0", "46": "15.0",
        M: "15.5", "50": "15.5", "50 M": "15.5",
        L: "16.0", "54": "16.0", "54 L": "16.0",
        XL: "16.5", "58": "16.5", "58 XL": "16.5",
        "2XL": "17.0", "62": "17.0", "62 2XL": "17.0",
        "3XL": "17.5", "66": "17.5", "66 3XL": "17.5",
        "4XL": "18.0", "70": "18.0"
      }
    },
    {
      code: "4",
      name: "Total length from center",
      norwegianName: "Totallengde midt bak",
      tolerance: "± 1.0",
      values: {
        XXS: "66.0", XS: "67.5", "42": "67.5", S: "69.0", "46": "69.0",
        M: "70.5", "50": "70.5", "50 M": "70.5",
        L: "72.0", "54": "72.0", "54 L": "72.0",
        XL: "73.5", "58": "73.5", "58 XL": "73.5",
        "2XL": "75.0", "62": "75.0", "62 2XL": "75.0",
        "3XL": "76.5", "66": "76.5", "66 3XL": "76.5",
        "4XL": "78.0", "70": "78.0"
      }
    },
    {
      code: "5",
      name: "Sleeve length long",
      norwegianName: "Ermelengde lang",
      tolerance: "± 1.0",
      values: {
        XXS: "64.0", XS: "65.0", "42": "65.0", S: "66.0", "46": "66.0",
        M: "67.0", "50": "67.0", "50 M": "67.0",
        L: "68.0", "54": "68.0", "54 L": "68.0",
        XL: "69.0", "58": "69.0", "58 XL": "69.0",
        "2XL": "70.0", "62": "70.0", "62 2XL": "70.0",
        "3XL": "71.0", "66": "71.0", "66 3XL": "71.0",
        "4XL": "72.0", "70": "72.0"
      }
    },
    {
      code: "6",
      name: "armhole",
      norwegianName: "Ermehull",
      tolerance: "± 0.5",
      values: {
        XXS: "20.0", XS: "21.0", "42": "21.0", S: "22.0", "46": "22.0",
        M: "23.0", "50": "23.0", "50 M": "23.0",
        L: "24.0", "54": "24.0", "54 L": "24.0",
        XL: "25.0", "58": "25.0", "58 XL": "25.0",
        "2XL": "26.0", "62": "26.0", "62 2XL": "26.0",
        "3XL": "27.0", "66": "27.0", "66 3XL": "27.0",
        "4XL": "28.0", "70": "28.0"
      }
    },
    {
      code: "7",
      name: "Half bottom sleeve",
      norwegianName: "½ Ermeåpning bunn",
      tolerance: "± 0.5",
      values: {
        XXS: "11.0", XS: "11.5", "42": "11.5", S: "12.0", "46": "12.0",
        M: "12.5", "50": "12.5", "50 M": "12.5",
        L: "13.0", "54": "13.0", "54 L": "13.0",
        XL: "13.5", "58": "13.5", "58 XL": "13.5",
        "2XL": "14.0", "62": "14.0", "62 2XL": "14.0",
        "3XL": "14.5", "66": "14.5", "66 3XL": "14.5",
        "4XL": "15.0", "70": "15.0"
      }
    },
    {
      code: "8",
      name: "Collar back height",
      norwegianName: "Kragehøyde bak",
      tolerance: "± 0.2",
      values: {
        XXS: "6.5", XS: "6.5", "42": "6.5", S: "6.5", "46": "6.5",
        M: "6.5", "50": "6.5", "50 M": "6.5",
        L: "6.5", "54": "6.5", "54 L": "6.5",
        XL: "6.5", "58": "6.5", "58 XL": "6.5",
        "2XL": "6.5", "62": "6.5", "62 2XL": "6.5",
        "3XL": "6.5", "66": "6.5", "66 3XL": "6.5",
        "4XL": "6.5", "70": "6.5"
      }
    },
    {
      code: "9",
      name: "Collar length",
      norwegianName: "Kragelengde",
      tolerance: "± 1.0",
      values: {
        XXS: "48.0", XS: "49.0", "42": "49.0", S: "50.0", "46": "50.0",
        M: "51.0", "50": "51.0", "50 M": "51.0",
        L: "52.0", "54": "52.0", "54 L": "52.0",
        XL: "53.0", "58": "53.0", "58 XL": "53.0",
        "2XL": "54.0", "62": "54.0", "62 2XL": "54.0",
        "3XL": "55.0", "66": "55.0", "66 3XL": "55.0",
        "4XL": "56.0", "70": "56.0"
      }
    }
  ]
};

// 7. Article 10123 (Bodø Softshell / Fleece Vest)
const SIZE_CHART_10123 = {
  title: "Size Chart for Article 10123 (Bodø)",
  applicableStyles: ["10123"],
  unit: "cm",
  sizes: [
    { key: "XXS", label: "XXS", colorBadge: "light grey", colorHex: "#cbd5e1", textHex: "#0f172a", bgLight: "#f8fafc", border: "#cbd5e1" },
    { key: "XS", label: "XS (42)", colorBadge: "yellow", colorHex: "#eab308", textHex: "#0f172a", bgLight: "#fef9c3", border: "#fde047" },
    { key: "S", label: "S (46)", colorBadge: "green", colorHex: "#22c55e", textHex: "#0f172a", bgLight: "#dcfce7", border: "#86efac" },
    { key: "M", label: "M (50)", colorBadge: "medium blue", colorHex: "#3b82f6", textHex: "#0f172a", bgLight: "#dbeafe", border: "#93c5fd" },
    { key: "L", label: "L (54)", colorBadge: "red", colorHex: "#ef4444", textHex: "#0f172a", bgLight: "#fee2e2", border: "#fca5a5" },
    { key: "XL", label: "XL (58)", colorBadge: "black", colorHex: "#1e293b", textHex: "#ffffff", bgLight: "#f1f5f9", border: "#cbd5e1" },
    { key: "2XL", label: "2XL (62)", colorBadge: "violet", colorHex: "#8b5cf6", textHex: "#ffffff", bgLight: "#ede9fe", border: "#c4b5fd" },
    { key: "3XL", label: "3XL (66)", colorBadge: "brown", colorHex: "#78350f", textHex: "#ffffff", bgLight: "#fef3c7", border: "#d97706" },
    { key: "4XL", label: "4XL (70)", colorBadge: "orange", colorHex: "#ea580c", textHex: "#ffffff", bgLight: "#ffedd5", border: "#fb923c" }
  ],
  measurements: [
    {
      code: "1",
      name: "Total length from center",
      norwegianName: "Totallengde midt bak",
      tolerance: "± 1.0",
      values: {
        XXS: "67.5", XS: "69.0", "42": "69.0", S: "70.5", "46": "70.5",
        M: "72.0", "50": "72.0", "50 M": "72.0",
        L: "73.5", "54": "73.5", "54 L": "73.5",
        XL: "75.0", "58": "75.0", "58 XL": "75.0",
        "2XL": "76.5", "62": "76.5", "62 2XL": "76.5",
        "3XL": "78.0", "66": "78.0", "4XL": "79.5", "70": "79.5"
      }
    },
    {
      code: "2",
      name: "Shoulder width",
      norwegianName: "Skulderbredde",
      tolerance: "± 1.0",
      values: {
        XXS: "46.4", XS: "47.6", "42": "47.6", S: "48.8", "46": "48.8",
        M: "50.0", "50": "50.0", "50 M": "50.0",
        L: "51.2", "54": "51.2", "54 L": "51.2",
        XL: "52.4", "58": "52.4", "58 XL": "52.4",
        "2XL": "53.6", "62": "53.6", "62 2XL": "53.6",
        "3XL": "54.8", "66": "54.8", "4XL": "56.0", "70": "56.0"
      }
    },
    {
      code: "3",
      name: "Half chest",
      norwegianName: "½ Brystvidde",
      tolerance: "± 1.0",
      values: {
        XXS: "48.0", XS: "51.0", "42": "51.0", S: "54.0", "46": "54.0",
        M: "57.0", "50": "57.0", "50 M": "57.0",
        L: "60.0", "54": "60.0", "54 L": "60.0",
        XL: "63.0", "58": "63.0", "58 XL": "63.0",
        "2XL": "66.0", "62": "66.0", "62 2XL": "66.0",
        "3XL": "69.0", "66": "69.0", "4XL": "72.0", "70": "72.0"
      }
    },
    {
      code: "4",
      name: "Half bottom",
      norwegianName: "½ Bunnvidde",
      tolerance: "± 1.0",
      values: {
        XXS: "47.0", XS: "50.0", "42": "50.0", S: "53.0", "46": "53.0",
        M: "56.0", "50": "56.0", "50 M": "56.0",
        L: "59.0", "54": "59.0", "54 L": "59.0",
        XL: "62.0", "58": "62.0", "58 XL": "62.0",
        "2XL": "65.0", "62": "65.0", "62 2XL": "65.0",
        "3XL": "68.0", "66": "68.0", "4XL": "71.0", "70": "71.0"
      }
    },
    {
      code: "5",
      name: "Straight armhole",
      norwegianName: "Ermehull rett linje",
      tolerance: "± 0.5",
      values: {
        XXS: "20.0", XS: "20.5", "42": "20.5", S: "21.0", "46": "21.0",
        M: "21.5", "50": "21.5", "50 M": "21.5",
        L: "22.0", "54": "22.0", "54 L": "22.0",
        XL: "22.5", "58": "22.5", "58 XL": "22.5",
        "2XL": "23.0", "62": "23.0", "62 2XL": "23.0",
        "3XL": "23.5", "66": "23.5", "4XL": "24.0", "70": "24.0"
      }
    },
    {
      code: "6",
      name: "Sleeve length long",
      norwegianName: "Ermelengde lang",
      tolerance: "± 1.0",
      values: {
        XXS: "63.0", XS: "64.0", "42": "64.0", S: "65.0", "46": "65.0",
        M: "66.0", "50": "66.0", "50 M": "66.0",
        L: "67.0", "54": "67.0", "54 L": "67.0",
        XL: "68.0", "58": "68.0", "58 XL": "68.0",
        "2XL": "69.0", "62": "69.0", "62 2XL": "69.0",
        "3XL": "70.0", "66": "70.0", "4XL": "71.0", "70": "71.0"
      }
    },
    {
      code: "7",
      name: "Half bottom sleeve",
      norwegianName: "½ Ermeåpning bunn",
      tolerance: "± 0.5",
      values: {
        XXS: "12.5", XS: "13.0", "42": "13.0", S: "13.5", "46": "13.5",
        M: "14.0", "50": "14.0", "50 M": "14.0",
        L: "14.5", "54": "14.5", "54 L": "14.5",
        XL: "15.0", "58": "15.0", "58 XL": "15.0",
        "2XL": "15.5", "62": "15.5", "62 2XL": "15.5",
        "3XL": "16.0", "66": "16.0", "4XL": "16.5", "70": "16.5"
      }
    },
    {
      code: "8",
      name: "Collar back height",
      norwegianName: "Kragehøyde bak",
      tolerance: "± 0.2",
      values: {
        XXS: "7.0", XS: "7.0", "42": "7.0", S: "7.0", "46": "7.0",
        M: "7.0", "50": "7.0", "50 M": "7.0",
        L: "7.0", "54": "7.0", "54 L": "7.0",
        XL: "7.0", "58": "7.0", "58 XL": "7.0",
        "2XL": "7.0", "62": "7.0", "62 2XL": "7.0",
        "3XL": "7.0", "66": "7.0", "4XL": "7.0", "70": "7.0"
      }
    },
    {
      code: "9",
      name: "Neck opening width",
      norwegianName: "Halsåpning vidde",
      tolerance: "± 0.5",
      values: {
        XXS: "19.5", XS: "20.0", "42": "20.0", S: "20.5", "46": "20.5",
        M: "21.0", "50": "21.0", "50 M": "21.0",
        L: "21.5", "54": "21.5", "54 L": "21.5",
        XL: "22.0", "58": "22.0", "58 XL": "22.0",
        "2XL": "22.5", "62": "22.5", "62 2XL": "22.5",
        "3XL": "23.0", "66": "23.0", "4XL": "23.5", "70": "23.5"
      }
    },
    {
      code: "10",
      name: "Back neck depth (from hsp)",
      norwegianName: "Halsdybde bak (fra HSP)",
      tolerance: "± 0.2",
      values: {
        XXS: "1.5", XS: "1.5", "42": "1.5", S: "1.5", "46": "1.5",
        M: "1.5", "50": "1.5", "50 M": "1.5",
        L: "1.5", "54": "1.5", "54 L": "1.5",
        XL: "1.5", "58": "1.5", "58 XL": "1.5",
        "2XL": "1.5", "62": "1.5", "62 2XL": "1.5",
        "3XL": "1.5", "66": "1.5", "4XL": "1.5", "70": "1.5"
      }
    },
    {
      code: "11",
      name: "Collar length (down)",
      norwegianName: "Kragelengde (nede)",
      tolerance: "± 0.5",
      values: {
        XXS: "49.6", XS: "50.9", "42": "50.9", S: "52.2", "46": "52.2",
        M: "53.5", "50": "53.5", "50 M": "53.5",
        L: "54.8", "54": "54.8", "54 L": "54.8",
        XL: "56.1", "58": "56.1", "58 XL": "56.1",
        "2XL": "57.4", "62": "57.4", "62 2XL": "57.4",
        "3XL": "58.7", "66": "58.7", "4XL": "60.0", "70": "60.0"
      }
    }
  ]
};

// 8. Article 10124 (Oslo Workwear Trousers)
const SIZE_CHART_10124 = {
  title: "Size Chart for Article 10124 (Oslo Workwear Trousers)",
  applicableStyles: ["10124"],
  unit: "cm",
  sizes: [
    { key: "XS", label: "XS (42)", colorBadge: "yellow", colorHex: "#eab308", textHex: "#0f172a", bgLight: "#fef9c3", border: "#fde047" },
    { key: "S", label: "S (46)", colorBadge: "green", colorHex: "#22c55e", textHex: "#0f172a", bgLight: "#dcfce7", border: "#86efac" },
    { key: "M", label: "M (50)", colorBadge: "medium blue", colorHex: "#3b82f6", textHex: "#0f172a", bgLight: "#dbeafe", border: "#93c5fd" },
    { key: "L", label: "L (54)", colorBadge: "red", colorHex: "#ef4444", textHex: "#0f172a", bgLight: "#fee2e2", border: "#fca5a5" },
    { key: "XL", label: "XL (58)", colorBadge: "black", colorHex: "#1e293b", textHex: "#ffffff", bgLight: "#f1f5f9", border: "#cbd5e1" },
    { key: "2XL", label: "2XL (62)", colorBadge: "violet", colorHex: "#8b5cf6", textHex: "#ffffff", bgLight: "#ede9fe", border: "#c4b5fd" },
    { key: "3XL", label: "3XL (66)", colorBadge: "brown", colorHex: "#78350f", textHex: "#ffffff", bgLight: "#fef3c7", border: "#d97706" }
  ],
  measurements: [
    {
      code: "1",
      name: "½ Waist",
      norwegianName: "½ Midjevidde",
      tolerance: "± 1.0",
      values: {
        XS: "40.0", "42": "40.0",
        S: "42.5", "46": "42.5",
        M: "45.0", "50": "45.0", "50 M": "45.0",
        L: "47.5", "54": "47.5", "54 L": "47.5",
        XL: "50.0", "58": "50.0", "58 XL": "50.0",
        "2XL": "52.5", "62": "52.5", "62 2XL": "52.5",
        "3XL": "55.0", "66": "55.0"
      }
    },
    {
      code: "2",
      name: "½ Hip",
      norwegianName: "½ Hoftevidde",
      tolerance: "± 1.0",
      values: {
        XS: "53.3", "42": "53.3",
        S: "55.5", "46": "55.5",
        M: "57.7", "50": "57.7", "50 M": "57.7",
        L: "60.0", "54": "60.0", "54 L": "60.0",
        XL: "62.0", "58": "62.0", "58 XL": "62.0",
        "2XL": "64.0", "62": "64.0", "62 2XL": "64.0",
        "3XL": "66.0", "66": "66.0"
      }
    },
    {
      code: "3",
      name: "½ Thigh",
      norwegianName: "½ Lårvidde",
      tolerance: "± 0.5",
      values: {
        XS: "32.1", "42": "32.1",
        S: "33.4", "46": "33.4",
        M: "34.7", "50": "34.7", "50 M": "34.7",
        L: "36.0", "54": "36.0", "54 L": "36.0",
        XL: "37.3", "58": "37.3", "58 XL": "37.3",
        "2XL": "38.6", "62": "38.6", "62 2XL": "38.6",
        "3XL": "39.9", "66": "39.9"
      }
    },
    {
      code: "4",
      name: "½ Bottom",
      norwegianName: "½ Bunnvidde / Fotvidde",
      tolerance: "± 0.5",
      values: {
        XS: "21.6", "42": "21.6",
        S: "21.9", "46": "21.9",
        M: "22.2", "50": "22.2", "50 M": "22.2",
        L: "22.5", "54": "22.5", "54 L": "22.5",
        XL: "22.7", "58": "22.7", "58 XL": "22.7",
        "2XL": "23.0", "62": "23.0", "62 2XL": "23.0",
        "3XL": "23.3", "66": "23.3"
      }
    },
    {
      code: "5",
      name: "½ Knee",
      norwegianName: "½ Knevidde",
      tolerance: "± 0.5",
      values: {
        XS: "24.2", "42": "24.2",
        S: "24.8", "46": "24.8",
        M: "25.4", "50": "25.4", "50 M": "25.4",
        L: "26.0", "54": "26.0", "54 L": "26.0",
        XL: "26.6", "58": "26.6", "58 XL": "26.6",
        "2XL": "27.2", "62": "27.2", "62 2XL": "27.2",
        "3XL": "27.8", "66": "27.8"
      }
    },
    {
      code: "6",
      name: "Inseam",
      norwegianName: "Innside benlengde",
      tolerance: "± 1.0",
      values: {
        XS: "82.0", "42": "82.0",
        S: "82.0", "46": "82.0",
        M: "82.0", "50": "82.0", "50 M": "82.0",
        L: "82.0", "54": "82.0", "54 L": "82.0",
        XL: "82.0", "58": "82.0", "58 XL": "82.0",
        "2XL": "82.0", "62": "82.0", "62 2XL": "82.0",
        "3XL": "82.0", "66": "82.0"
      }
    },
    {
      code: "7",
      name: "Zipper fly",
      norwegianName: "Glidelås gylf",
      tolerance: "—",
      values: {
        XS: "14.0", "42": "14.0",
        S: "15.0", "46": "15.0",
        M: "15.0", "50": "15.0", "50 M": "15.0",
        L: "16.0", "54": "16.0", "54 L": "16.0",
        XL: "17.0", "58": "17.0", "58 XL": "17.0",
        "2XL": "17.0", "62": "17.0", "62 2XL": "17.0",
        "3XL": "17.0", "66": "17.0"
      }
    }
  ]
};

// 9. Article 20110 (Stockholm)
const SIZE_CHART_20110 = {
  title: "Size Chart for Article 20110 (Stockholm)",
  applicableStyles: ["20110"],
  unit: "cm",
  sizes: [
    { key: "XXS", label: "XXS (36/38)", colorBadge: "light grey", colorHex: "#cbd5e1", textHex: "#334155" },
    { key: "XS", label: "XS (40/42)", colorBadge: "yellow", colorHex: "#eab308", textHex: "#854d0e" },
    { key: "S", label: "S (44/46)", colorBadge: "green", colorHex: "#22c55e", textHex: "#14532d" },
    { key: "M", label: "M (48/50)", colorBadge: "medium blue", colorHex: "#3b82f6", textHex: "#1e3a8a" },
    { key: "L", label: "L (52/54)", colorBadge: "red", colorHex: "#ef4444", textHex: "#7f1d1d" },
    { key: "XL", label: "XL (56/58)", colorBadge: "black", colorHex: "#1e293b", textHex: "#ffffff" },
    { key: "2XL", label: "2XL (60/62)", colorBadge: "violet", colorHex: "#8b5cf6", textHex: "#ffffff" },
    { key: "3XL", label: "3XL (64/66)", colorBadge: "brown", colorHex: "#78350f", textHex: "#ffffff" },
    { key: "4XL", label: "4XL (68/70)", colorBadge: "orange", colorHex: "#ea580c", textHex: "#ffffff" },
    { key: "5XL", label: "5XL (72/74)", colorBadge: "turquoise", colorHex: "#06b6d4", textHex: "#ffffff" },
    { key: "XS-Long", label: "XS-Long", colorBadge: "yellow", colorHex: "#ca8a04", textHex: "#ffffff" },
    { key: "S-Long", label: "S-Long", colorBadge: "green", colorHex: "#16a34a", textHex: "#ffffff" },
    { key: "M-Long", label: "M-Long", colorBadge: "medium blue", colorHex: "#2563eb", textHex: "#ffffff" },
    { key: "L-Long", label: "L-Long", colorBadge: "red", colorHex: "#dc2626", textHex: "#ffffff" },
    { key: "XL-Long", label: "XL-Long", colorBadge: "black", colorHex: "#0f172a", textHex: "#ffffff" },
    { key: "2XL-Long", label: "2XL-Long", colorBadge: "violet", colorHex: "#7c3aed", textHex: "#ffffff" },
    { key: "3XL-Long", label: "3XL-Long", colorBadge: "brown", colorHex: "#92400e", textHex: "#ffffff" }
  ],
  measurements: [
    { code: "CHEST", name: "Oberweite (Chest)", norwegianName: "Brystvidde", tolerance: "± 2", values: { XXS: "98", XS: "102", S: "108", M: "116", L: "124", XL: "132", "2XL": "140", "3XL": "148", "4XL": "156", "5XL": "164", "XS-Long": "102", "S-Long": "108", "M-Long": "116", "L-Long": "124", "XL-Long": "132", "2XL-Long": "140", "3XL-Long": "148" } },
    { code: "HALF_CHEST", name: "½ Oberweite (½ Chest)", norwegianName: "½ Brystvidde", tolerance: "± 1", values: { XXS: "49", XS: "51", S: "54", M: "58", L: "62", XL: "66", "2XL": "70", "3XL": "74", "4XL": "78", "5XL": "82", "XS-Long": "51", "S-Long": "54", "M-Long": "58", "L-Long": "62", "XL-Long": "66", "2XL-Long": "70", "3XL-Long": "74" } },
    { code: "WAIST", name: "Taillenweite (Waist)", norwegianName: "Midjevidde", tolerance: "± 2", values: { XXS: "94", XS: "98", S: "104", M: "112", L: "120", XL: "128", "2XL": "136", "3XL": "144", "4XL": "152", "5XL": "160", "XS-Long": "96", "S-Long": "102", "M-Long": "110", "L-Long": "118", "XL-Long": "126", "2XL-Long": "134", "3XL-Long": "142" } },
    { code: "HALF_WAIST", name: "½ Taillenweite (½ Waist)", norwegianName: "½ Midjevidde", tolerance: "± 1", values: { XXS: "47", XS: "49", S: "52", M: "56", L: "60", XL: "64", "2XL": "68", "3XL": "72", "4XL": "76", "5XL": "80", "XS-Long": "48", "S-Long": "51", "M-Long": "55", "L-Long": "59", "XL-Long": "63", "2XL-Long": "67", "3XL-Long": "71" } },
    { code: "SLEEVE", name: "Armlänge incl. Manschette (Sleeve length with cuff)", norwegianName: "Ermelengde inkl. mansjett", tolerance: "± 1", values: { XXS: "61", XS: "63", S: "65", M: "67", L: "69", XL: "71", "2XL": "73", "3XL": "75", "4XL": "77", "5XL": "79", "XS-Long": "66", "S-Long": "68", "M-Long": "70", "L-Long": "72", "XL-Long": "74", "2XL-Long": "76", "3XL-Long": "78" } },
    { code: "BACK_WIDTH", name: "Rückenbreite (Back width)", norwegianName: "Ryggbredde", tolerance: "± 1", values: { XXS: "41", XS: "43", S: "45", M: "47", L: "49", XL: "51", "2XL": "53", "3XL": "55", "4XL": "57", "5XL": "59", "XS-Long": "43", "S-Long": "45", "M-Long": "47", "L-Long": "49", "XL-Long": "51", "2XL-Long": "53", "3XL-Long": "55" } },
    { code: "HALF_BACK_WIDTH", name: "½ Rückenbreite (½ Back width)", norwegianName: "½ Ryggbredde", tolerance: "± 0.5", values: { XXS: "20.5", XS: "21.5", S: "22.5", M: "23.5", L: "24.5", XL: "25.5", "2XL": "26.5", "3XL": "27.5", "4XL": "28.5", "5XL": "29.5", "XS-Long": "21.5", "S-Long": "22.5", "M-Long": "23.5", "L-Long": "24.5", "XL-Long": "25.5", "2XL-Long": "26.5", "3XL-Long": "27.5" } },
    { code: "BACK_LENGTH", name: "Rückenlänge (Center back length)", norwegianName: "Rygglengde midt bak", tolerance: "± 1", values: { XXS: "70", XS: "72", S: "74", M: "76", L: "78", XL: "80", "2XL": "82", "3XL": "84", "4XL": "86", "5XL": "88", "XS-Long": "75", "S-Long": "77", "M-Long": "79", "L-Long": "81", "XL-Long": "83", "2XL-Long": "85", "3XL-Long": "87" } }
  ]
};

// 10. Article 20111 (Borås)
const SIZE_CHART_20111 = {
  title: "Size Chart for Article 20111 (Borås)",
  applicableStyles: ["20111"],
  unit: "cm",
  sizes: [
    { key: "XS", label: "XS (30-32)", colorBadge: "yellow", colorHex: "#eab308", textHex: "#854d0e" },
    { key: "S", label: "S (34-36)", colorBadge: "green", colorHex: "#22c55e", textHex: "#14532d" },
    { key: "M", label: "M (38-40)", colorBadge: "medium blue", colorHex: "#3b82f6", textHex: "#1e3a8a" },
    { key: "L", label: "L (42-44)", colorBadge: "red", colorHex: "#ef4444", textHex: "#7f1d1d" },
    { key: "XL", label: "XL (46-48)", colorBadge: "black", colorHex: "#1e293b", textHex: "#ffffff" },
    { key: "2XL", label: "2XL (50-52)", colorBadge: "violet", colorHex: "#8b5cf6", textHex: "#ffffff" },
    { key: "3XL", label: "3XL (54-56)", colorBadge: "brown", colorHex: "#78350f", textHex: "#ffffff" }
  ],
  measurements: [
    { code: "CHEST", name: "Oberweite (Chest)", norwegianName: "Brystvidde", tolerance: "± 2", values: { XS: "92", S: "100", M: "108", L: "116", XL: "126", "2XL": "138", "3XL": "150" } },
    { code: "HALF_CHEST", name: "½ Oberweite (½ Chest)", norwegianName: "½ Brystvidde", tolerance: "± 1", values: { XS: "46", S: "50", M: "54", L: "58", XL: "63", "2XL": "69", "3XL": "75" } },
    { code: "WAIST", name: "Taillenweite (Waist)", norwegianName: "Midjevidde", tolerance: "± 2", values: { XS: "79", S: "87", M: "95", L: "103", XL: "113", "2XL": "125", "3XL": "137" } },
    { code: "HALF_WAIST", name: "½ Taillenweite (½ Waist)", norwegianName: "½ Midjevidde", tolerance: "± 1", values: { XS: "39.5", S: "43.5", M: "47.5", L: "51.5", XL: "56.5", "2XL": "62.5", "3XL": "68.5" } },
    { code: "SLEEVE_NO_CUFF", name: "Armlänge bis Umschlag (Sleeve length without cuff)", norwegianName: "Ermelengde uten mansjett", tolerance: "± 1", values: { XS: "55", S: "55", M: "56", L: "56.5", XL: "57", "2XL": "57.5", "3XL": "58" } },
    { code: "SLEEVE_WITH_CUFF", name: "Armlänge incl. Manschette (Sleeve length with cuff)", norwegianName: "Ermelengde inkl. mansjett", tolerance: "± 1", values: { XS: "65.5", S: "65.5", M: "66.5", L: "67", XL: "67.5", "2XL": "68", "3XL": "68.5" } },
    { code: "BACK_WIDTH", name: "Rückenbreite (Back width)", norwegianName: "Ryggbredde", tolerance: "± 1", values: { XS: "36", S: "38", M: "40", L: "42", XL: "44", "2XL": "47", "3XL": "50" } },
    { code: "HALF_BACK_WIDTH", name: "½ Rückenbreite (½ Back width)", norwegianName: "½ Ryggbredde", tolerance: "± 0.5", values: { XS: "18", S: "19", M: "20", L: "21", XL: "22", "2XL": "23.5", "3XL": "25" } },
    { code: "BACK_LENGTH", name: "Rückenlänge (Center back length)", norwegianName: "Rygglengde midt bak", tolerance: "± 1", values: { XS: "67", S: "69", M: "71", L: "73", XL: "75", "2XL": "75", "3XL": "75" } }
  ]
};

// 11. Articles 200120, 200121, 200122 (Odense, Vejle, Skagen)
const SIZES_200120 = [
  "N38", "40", "42", "44", "46", "48", "50", "52", "54", "56", "58", "60", "62", "64", "66", "68", "70", "72", "74",
  "80", "84", "88", "90", "94", "98", "102", "106", "110", "114", "118", "122", "126", "130",
  "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36"
];

const SIZE_CHART_200120 = {
  title: "Size Chart for Article 200120, 200121, 200122",
  applicableStyles: ["200120", "200121", "200122"],
  unit: "cm",
  sizes: SIZES_200120.map((sz) => ({
    key: sz,
    label: sz,
    colorBadge: "standard",
    colorHex: "#3b82f6",
    textHex: "#ffffff"
  })),
  measurements: [
    {
      code: "WAISTBAND",
      name: "Bundweite (Waistband width)",
      norwegianName: "Linningvidde",
      tolerance: "± 2",
      values: {
        N38: "60", "40": "62", "42": "66", "44": "70", "46": "74", "48": "78", "50": "82", "52": "86", "54": "90", "56": "95", "58": "100", "60": "105", "62": "110", "64": "114", "66": "118", "68": "122", "70": "126", "72": "130", "74": "134",
        "80": "60", "84": "64", "88": "68", "90": "72", "94": "76", "98": "80", "102": "84", "106": "88", "110": "93", "114": "98", "118": "103", "122": "108", "126": "112", "130": "116",
        "20": "66", "21": "70", "22": "74", "23": "78", "24": "82", "25": "86", "26": "90", "27": "94", "28": "99", "29": "104", "30": "109", "31": "114", "32": "118", "33": "122", "34": "126", "35": "130", "36": "134"
      }
    },
    {
      code: "HALF_WAISTBAND",
      name: "½ Bundweite (½ Waistband width)",
      norwegianName: "½ Linningvidde",
      tolerance: "± 1",
      values: {
        N38: "30", "40": "31", "42": "33", "44": "35", "46": "37", "48": "39", "50": "41", "52": "43", "54": "45", "56": "47.5", "58": "50", "60": "52.5", "62": "55", "64": "57", "66": "59", "68": "61", "70": "63", "72": "65", "74": "67",
        "80": "30", "84": "32", "88": "34", "90": "36", "94": "38", "98": "40", "102": "42", "106": "44", "110": "46.5", "114": "49", "118": "51.5", "122": "54", "126": "56", "130": "58",
        "20": "33", "21": "35", "22": "37", "23": "39", "24": "41", "25": "43", "26": "45", "27": "47", "28": "49.5", "29": "52", "30": "54.5", "31": "57", "32": "59", "33": "61", "34": "63", "35": "65", "36": "67"
      }
    },
    {
      code: "HIP",
      name: "Hüftweite (Hip)",
      norwegianName: "Hoftevidde",
      tolerance: "± 2",
      values: {
        N38: "84", "40": "88", "42": "92", "44": "96", "46": "100", "48": "104", "50": "108", "52": "112", "54": "116", "56": "121", "58": "126", "60": "131", "62": "135", "64": "139", "66": "142", "68": "146", "70": "150", "72": "153", "74": "157",
        "80": "86", "84": "90", "88": "94", "90": "98", "94": "102", "98": "106", "102": "110", "106": "114", "110": "119", "114": "124", "118": "129", "122": "133", "126": "137", "130": "140",
        "20": "90", "21": "94", "22": "98", "23": "102", "24": "106", "25": "110", "26": "114", "27": "118", "28": "123", "29": "128", "30": "133", "31": "137", "32": "141", "33": "144", "34": "148", "35": "152", "36": "155"
      }
    },
    {
      code: "HALF_HIP",
      name: "½ Hüftweite (½ Hip)",
      norwegianName: "½ Hoftevidde",
      tolerance: "± 1",
      values: {
        N38: "42", "40": "44", "42": "46", "44": "48", "46": "50", "48": "52", "50": "54", "52": "56", "54": "58", "56": "60.5", "58": "63", "60": "65.5", "62": "67.5", "64": "69.5", "66": "71", "68": "73", "70": "75", "72": "76.5", "74": "78.5",
        "80": "43", "84": "45", "88": "47", "90": "49", "94": "51", "98": "53", "102": "55", "106": "57", "110": "59.5", "114": "62", "118": "64.5", "122": "66.5", "126": "68.5", "130": "70",
        "20": "45", "21": "47", "22": "49", "23": "51", "24": "53", "25": "55", "26": "57", "27": "59", "28": "61.5", "29": "64", "30": "66.5", "31": "68.5", "32": "70.5", "33": "72", "34": "74", "35": "76", "36": "77.5"
      }
    },
    {
      code: "HEM",
      name: "Fußweite (Hem width)",
      norwegianName: "Fotvidde",
      tolerance: "± 1",
      values: {
        N38: "35", "40": "36", "42": "36", "44": "37", "46": "37", "48": "38", "50": "38", "52": "38", "54": "40", "56": "40", "58": "40", "60": "42", "62": "42", "64": "42", "66": "44", "68": "44", "70": "44", "72": "46", "74": "46",
        "80": "36", "84": "36", "88": "37", "90": "37", "94": "38", "98": "38", "102": "38", "106": "40", "110": "40", "114": "40", "118": "42", "122": "42", "126": "42", "130": "44",
        "20": "36", "21": "36", "22": "37", "23": "37", "24": "38", "25": "38", "26": "38", "27": "40", "28": "40", "29": "40", "30": "42", "31": "42", "32": "42", "33": "44", "34": "44", "35": "44", "36": "46"
      }
    },
    {
      code: "SIDESEAM",
      name: "Seitenlänge mit Bund (Sideseam w/ waistband)",
      norwegianName: "Sidelengde med linning",
      tolerance: "± 1",
      values: {
        N38: "102", "40": "103.5", "42": "105", "44": "106.5", "46": "108", "48": "109.5", "50": "111", "52": "113.5", "54": "116", "56": "118", "58": "119", "60": "120", "62": "121", "64": "122", "66": "123", "68": "125", "70": "126", "72": "127", "74": "128",
        "80": "109", "84": "110.5", "88": "112", "90": "113.5", "94": "115", "98": "116.5", "102": "119", "106": "121.5", "110": "123.5", "114": "124.5", "118": "125.5", "122": "126.5", "126": "127.5", "130": "128.5",
        "20": "98.5", "21": "100", "22": "101.5", "23": "103", "24": "104.5", "25": "106", "26": "108.5", "27": "111", "28": "113", "29": "114", "30": "115", "31": "116", "32": "117", "33": "118", "34": "120", "35": "121", "36": "122"
      }
    },
    {
      code: "INSEAM",
      name: "Schrittlänge (Inseam length)",
      norwegianName: "Innside benlengde",
      tolerance: "± 1",
      values: {
        N38: "78", "40": "79", "42": "80", "44": "81", "46": "82", "48": "83", "50": "84", "52": "86", "54": "88", "56": "89", "58": "89", "60": "89", "62": "90", "64": "91", "66": "91", "68": "92", "70": "92", "72": "92", "74": "92",
        "80": "84", "84": "85", "88": "86", "90": "87", "94": "88", "98": "89", "102": "91", "106": "93", "110": "94", "114": "94", "118": "94", "122": "95", "126": "96", "130": "96",
        "20": "78", "21": "78", "22": "79", "23": "79", "24": "79", "25": "80", "26": "78", "27": "78", "28": "77", "29": "77", "30": "77", "31": "76", "32": "76", "33": "76", "34": "75", "35": "76", "36": "76"
      }
    },
    {
      code: "ZIPPER",
      name: "Reißverschlusslänge (Zipper length)",
      norwegianName: "Glidelåslengde",
      tolerance: "± 0.5",
      values: {
        N38: "13", "40": "13", "42": "13", "44": "13", "46": "13", "48": "13", "50": "13", "52": "16", "54": "16", "56": "16", "58": "16", "60": "16", "62": "16", "64": "20", "66": "20", "68": "20", "70": "20", "72": "20", "74": "20",
        "80": "13", "84": "13", "88": "13", "90": "13", "94": "13", "98": "13", "102": "16", "106": "16", "110": "16", "114": "16", "118": "16", "122": "16", "126": "20", "130": "20",
        "20": "13", "21": "13", "22": "13", "23": "13", "24": "13", "25": "13", "26": "16", "27": "16", "28": "16", "29": "16", "30": "16", "31": "16", "32": "20", "33": "20", "34": "20", "35": "20", "36": "20"
      }
    },
    {
      code: "RUBBER",
      name: "geschnittene Gummilänge (Cut rubber length)",
      norwegianName: "Strikklengde",
      tolerance: "± 1",
      values: {
        N38: "26", "40": "26", "42": "28", "44": "30", "46": "32", "48": "34", "50": "36", "52": "38", "54": "40", "56": "42.5", "58": "45", "60": "47.5", "62": "50", "64": "52", "66": "54", "68": "56", "70": "58", "72": "60", "74": "62",
        "80": "26", "84": "28", "88": "30", "90": "32", "94": "34", "98": "36", "102": "38", "106": "40", "110": "42.5", "114": "45", "118": "47.5", "122": "50", "126": "52", "130": "54",
        "20": "26", "21": "28", "22": "30", "23": "32", "24": "34", "25": "36", "26": "38", "27": "40", "28": "42.5", "29": "45", "30": "47.5", "31": "50", "32": "52", "33": "54", "34": "56", "35": "58", "36": "60"
      }
    }
  ]
};

// 12. Articles 200123, 200124, 200125 (Åre, Piteå, Umeå)
const SIZES_200123 = [
  "32", "34", "36", "38", "40", "42", "44", "46", "48", "50", "52", "54", "56", "58", "60",
  "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
  "64", "68", "72", "76", "80", "84", "88", "92", "96", "100", "104", "108", "112", "116", "120"
];

const SIZE_CHART_200123 = {
  title: "Size Chart for Article 200123, 200124, 200125",
  applicableStyles: ["200123", "200124", "200125"],
  unit: "cm",
  sizes: SIZES_200123.map((sz) => ({
    key: sz,
    label: sz,
    colorBadge: "standard",
    colorHex: "#3b82f6",
    textHex: "#ffffff"
  })),
  measurements: [
    {
      code: "WAISTBAND",
      name: "Bundweite (Waistband width)",
      norwegianName: "Linningvidde",
      tolerance: "± 2",
      values: {
        "32": "60", "34": "64", "36": "68", "38": "72", "40": "76", "42": "80", "44": "84", "46": "89", "48": "95", "50": "100", "52": "106", "54": "111", "56": "117", "58": "122", "60": "128",
        "16": "60", "17": "64", "18": "68", "19": "72", "20": "76", "21": "80", "22": "84", "23": "89", "24": "95", "25": "100", "26": "106", "27": "111", "28": "117", "29": "122", "30": "128",
        "64": "60", "68": "64", "72": "68", "76": "72", "80": "76", "84": "80", "88": "84", "92": "89", "96": "95", "100": "100", "104": "106", "108": "111", "112": "117", "116": "122", "120": "128"
      }
    },
    {
      code: "HALF_WAISTBAND",
      name: "½ Bundweite (½ Waistband width)",
      norwegianName: "½ Linningvidde",
      tolerance: "± 1",
      values: {
        "32": "30", "34": "32", "36": "34", "38": "36", "40": "38", "42": "40", "44": "42", "46": "44.5", "48": "47.5", "50": "50", "52": "53", "54": "55.5", "56": "58.5", "58": "61", "60": "64",
        "16": "30", "17": "32", "18": "34", "19": "36", "20": "38", "21": "40", "22": "42", "23": "44.5", "24": "47.5", "25": "50", "26": "53", "27": "55.5", "28": "58.5", "29": "61", "30": "64",
        "64": "30", "68": "32", "72": "34", "76": "36", "80": "38", "84": "40", "88": "42", "92": "44.5", "96": "47.5", "100": "50", "104": "53", "108": "55.5", "112": "58.5", "116": "61", "120": "64"
      }
    },
    {
      code: "HIP",
      name: "Hüftweite (Hip)",
      norwegianName: "Hoftevidde",
      tolerance: "± 2",
      values: {
        "32": "90", "34": "94", "36": "98", "38": "102", "40": "106", "42": "110", "44": "114", "46": "119", "48": "124", "50": "129", "52": "134", "54": "139", "56": "144", "58": "149", "60": "154",
        "16": "90", "17": "94", "18": "98", "19": "102", "20": "106", "21": "110", "22": "114", "23": "119", "24": "124", "25": "129", "26": "134", "27": "139", "28": "144", "29": "149", "30": "154",
        "64": "90", "68": "94", "72": "98", "76": "102", "80": "106", "84": "110", "88": "114", "92": "119", "96": "124", "100": "129", "104": "134", "108": "139", "112": "144", "116": "149", "120": "154"
      }
    },
    {
      code: "HALF_HIP",
      name: "½ Hüftweite (½ Hip)",
      norwegianName: "½ Hoftevidde",
      tolerance: "± 1",
      values: {
        "32": "45", "34": "47", "36": "49", "38": "51", "40": "53", "42": "55", "44": "57", "46": "59.5", "48": "62", "50": "64.5", "52": "67", "54": "69.5", "56": "72", "58": "74.5", "60": "77",
        "16": "45", "17": "47", "18": "49", "19": "51", "20": "53", "21": "55", "22": "57", "23": "59.5", "24": "62", "25": "64.5", "26": "67", "27": "69.5", "28": "72", "29": "74.5", "30": "77",
        "64": "45", "68": "47", "72": "49", "76": "51", "80": "53", "84": "55", "88": "57", "92": "59.5", "96": "62", "100": "64.5", "104": "67", "108": "69.5", "112": "72", "116": "74.5", "120": "77"
      }
    },
    {
      code: "HEM",
      name: "Fußweite (Hem width)",
      norwegianName: "Fotvidde",
      tolerance: "± 1",
      values: {
        "32": "34", "34": "34.5", "36": "35.5", "38": "36", "40": "36.5", "42": "37", "44": "37.5", "46": "39", "48": "40.5", "50": "42", "52": "43.5", "54": "45", "56": "46.5", "58": "48", "60": "49.5",
        "16": "34", "17": "34.5", "18": "35.5", "19": "36", "20": "36.5", "21": "37", "22": "37.5", "23": "39", "24": "40.5", "25": "42", "26": "43.5", "27": "45", "28": "46.5", "29": "48", "30": "49.5",
        "64": "34", "68": "34.5", "72": "35.5", "76": "36", "80": "36.5", "84": "37", "88": "37.5", "92": "39", "96": "40.5", "100": "42", "104": "43.5", "108": "45", "112": "46.5", "116": "48", "120": "49.5"
      }
    },
    {
      code: "SIDESEAM",
      name: "Seitenlänge mit Bund (Sideseam w/ waistband)",
      norwegianName: "Sidelengde med linning",
      tolerance: "± 1",
      values: {
        "32": "105.4", "34": "106.1", "36": "106.8", "38": "107.5", "40": "108.2", "42": "108.9", "44": "109.6", "46": "110.3", "48": "110.8", "50": "111.3", "52": "111.8", "54": "112.3", "56": "112.8", "58": "113.3", "60": "113.8",
        "16": "100.9", "17": "101.6", "18": "102.3", "19": "103", "20": "103.7", "21": "104.4", "22": "105.1", "23": "105.8", "24": "106.3", "25": "106.8", "26": "107.3", "27": "107.8", "28": "108.3", "29": "108.8", "30": "109.3",
        "64": "109.9", "68": "110.6", "72": "111.3", "76": "112", "80": "112.7", "84": "113.4", "88": "114.1", "92": "114.8", "96": "115.3", "100": "115.8", "104": "116.3", "108": "116.8", "112": "117.3", "116": "117.8", "120": "118.3"
      }
    },
    {
      code: "INSEAM",
      name: "Schrittlänge (Inseam length)",
      norwegianName: "Innside benlengde",
      tolerance: "± 1",
      values: {
        "32": "82", "34": "82", "36": "82", "38": "82", "40": "82", "42": "82", "44": "82", "46": "82", "48": "82", "50": "82", "52": "82", "54": "82", "56": "82", "58": "82", "60": "82",
        "16": "78", "17": "78", "18": "78", "19": "78", "20": "78", "21": "78", "22": "78", "23": "78", "24": "78", "25": "78", "26": "78", "27": "78", "28": "78", "29": "78", "30": "78",
        "64": "86", "68": "86", "72": "86", "76": "86", "80": "86", "84": "86", "88": "86", "92": "86", "96": "86", "100": "86", "104": "86", "108": "86", "112": "86", "116": "86", "120": "86"
      }
    },
    {
      code: "ZIPPER",
      name: "Reißverschlusslänge (Zipper length)",
      norwegianName: "Glidelåslengde",
      tolerance: "± 0.5",
      values: {
        "32": "11", "34": "11", "36": "12", "38": "12", "40": "12", "42": "12", "44": "12", "46": "12", "48": "14", "50": "14", "52": "14", "54": "14", "56": "16", "58": "16", "60": "16",
        "16": "11", "17": "11", "18": "12", "19": "12", "20": "12", "21": "12", "22": "12", "23": "12", "24": "14", "25": "14", "26": "14", "27": "14", "28": "16", "29": "16", "30": "16",
        "64": "11", "68": "11", "72": "12", "76": "12", "80": "12", "84": "12", "88": "12", "92": "12", "96": "14", "100": "14", "104": "14", "108": "14", "112": "16", "116": "16", "120": "16"
      }
    },
    {
      code: "RUBBER",
      name: "geschnittene Gummilänge (Cut rubber length)",
      norwegianName: "Strikklengde",
      tolerance: "± 1",
      values: {
        "32": "28", "34": "30", "36": "32", "38": "34", "40": "36", "42": "38", "44": "40", "46": "42.5", "48": "45.5", "50": "48", "52": "51", "54": "53.5", "56": "56.5", "58": "59", "60": "62",
        "16": "28", "17": "30", "18": "32", "19": "34", "20": "36", "21": "38", "22": "40", "23": "42.5", "24": "45.5", "25": "48", "26": "51", "27": "53.5", "28": "56.5", "29": "59", "30": "62",
        "64": "28", "68": "30", "72": "32", "76": "34", "80": "36", "84": "38", "88": "40", "92": "42.5", "96": "45.5", "100": "48", "104": "51", "108": "53.5", "112": "56.5", "116": "59", "120": "62"
      }
    }
  ]
};

// 13. Article 200126 (Arendal / Luleå)
const SIZES_200126 = [
  "N36", "N38", "40", "42", "44", "46", "48", "50", "52", "54", "56", "58", "60", "62", "64", "66", "68", "70",
  "80", "84", "88", "90", "94", "98", "102", "106", "110", "114", "118", "122", "126", "130",
  "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35",
  "47", "49", "51", "53", "55", "57", "59", "61", "63", "65", "67", "69", "71", "73", "75"
];

const SIZE_CHART_200126 = {
  title: "Size Chart for Article 200126",
  applicableStyles: ["200126"],
  unit: "cm",
  sizes: SIZES_200126.map((sz) => ({
    key: sz,
    label: sz,
    colorBadge: "standard",
    colorHex: "#3b82f6",
    textHex: "#ffffff"
  })),
  measurements: [
    {
      code: "WAISTBAND",
      name: "Bundweite (Waistband width)",
      norwegianName: "Linningvidde",
      tolerance: "± 2",
      values: {
        N36: "57", N38: "61", "40": "63", "42": "65", "44": "67", "46": "71", "48": "75", "50": "79", "52": "83", "54": "87", "56": "93", "58": "99", "60": "105", "62": "111", "64": "117", "66": "123", "68": "129", "70": "135",
        "80": "61", "84": "63", "88": "65", "90": "69", "94": "73", "98": "77", "102": "81", "106": "85", "110": "91", "114": "97", "118": "103", "122": "109", "126": "115", "130": "121",
        "20": "63", "21": "67", "22": "71", "23": "75", "24": "79", "25": "83", "26": "87", "27": "91", "28": "97", "29": "103", "30": "109", "31": "115", "32": "121", "33": "127", "34": "133", "35": "139",
        "47": "101", "49": "106", "51": "111", "53": "116", "55": "121", "57": "126", "59": "131", "61": "136", "63": "141", "65": "146", "67": "151", "69": "156", "71": "161", "73": "166", "75": "171"
      }
    },
    {
      code: "HALF_WAISTBAND",
      name: "½ Bundweite (½ Waistband width)",
      norwegianName: "½ Linningvidde",
      tolerance: "± 1",
      values: {
        N36: "28.5", N38: "30.5", "40": "31.5", "42": "32.5", "44": "33.5", "46": "35.5", "48": "37.5", "50": "39.5", "52": "41.5", "54": "43.5", "56": "46.5", "58": "49.5", "60": "52.5", "62": "55.5", "64": "58.5", "66": "61.5", "68": "64.5", "70": "67.5",
        "80": "30.5", "84": "31.5", "88": "32.5", "90": "34.5", "94": "36.5", "98": "38.5", "102": "40.5", "106": "42.5", "110": "45.5", "114": "48.5", "118": "51.5", "122": "54.5", "126": "57.5", "130": "60.5",
        "20": "31.5", "21": "33.5", "22": "35.5", "23": "37.5", "24": "39.5", "25": "41.5", "26": "43.5", "27": "45.5", "28": "48.5", "29": "51.5", "30": "54.5", "31": "57.5", "32": "60.5", "33": "63.5", "34": "66.5", "35": "69.5",
        "47": "50.5", "49": "53", "51": "55.5", "53": "58", "55": "60.5", "57": "63", "59": "65.5", "61": "68", "63": "70.5", "65": "73", "67": "75.5", "69": "78", "71": "80.5", "73": "83", "75": "85.5"
      }
    },
    {
      code: "HIP",
      name: "Hüftweite (Hip)",
      norwegianName: "Hoftevidde",
      tolerance: "± 2",
      values: {
        N36: "86", N38: "90", "40": "92", "42": "94", "44": "96", "46": "100", "48": "104", "50": "108", "52": "112", "54": "116", "56": "121", "58": "126", "60": "131", "62": "136", "64": "141", "66": "146", "68": "151", "70": "156",
        "80": "90", "84": "92", "88": "94", "90": "98", "94": "102", "98": "106", "102": "110", "106": "114", "110": "119", "114": "124", "118": "129", "122": "134", "126": "139", "130": "144",
        "20": "90", "21": "94", "22": "98", "23": "102", "24": "106", "25": "110", "26": "114", "27": "118", "28": "123", "29": "128", "30": "133", "31": "138", "32": "143", "33": "148", "34": "153", "35": "158",
        "47": "115", "49": "120", "51": "125", "53": "130", "55": "135", "57": "140", "59": "145", "61": "150", "63": "155", "65": "160", "67": "165", "69": "170", "71": "175", "73": "180", "75": "185"
      }
    },
    {
      code: "HALF_HIP",
      name: "½ Hüftweite (½ Hip)",
      norwegianName: "½ Hoftevidde",
      tolerance: "± 1",
      values: {
        N36: "43", N38: "45", "40": "46", "42": "47", "44": "48", "46": "50", "48": "52", "50": "54", "52": "56", "54": "58", "56": "60.5", "58": "63", "60": "65.5", "62": "68", "64": "70.5", "66": "73", "68": "75.5", "70": "78",
        "80": "45", "84": "46", "88": "47", "90": "49", "94": "51", "98": "53", "102": "55", "106": "57", "110": "59.5", "114": "62", "118": "64.5", "122": "67", "126": "69.5", "130": "72",
        "20": "45", "21": "47", "22": "49", "23": "51", "24": "53", "25": "55", "26": "57", "27": "59", "28": "61.5", "29": "64", "30": "66.5", "31": "69", "32": "71.5", "33": "74", "34": "76.5", "35": "79",
        "47": "57.5", "49": "60", "51": "62.5", "53": "65", "55": "67.5", "57": "70", "59": "72.5", "61": "75", "63": "77.5", "65": "80", "67": "82.5", "69": "85", "71": "87.5", "73": "90", "75": "92.5"
      }
    },
    {
      code: "HEM",
      name: "Fußweite (Hem width)",
      norwegianName: "Fotvidde",
      tolerance: "± 1",
      values: {
        N36: "35", N38: "37", "40": "38", "42": "40", "44": "41", "46": "41", "48": "42", "50": "42", "52": "43", "54": "43", "56": "43", "58": "43", "60": "43", "62": "45", "64": "45", "66": "45", "68": "45", "70": "45",
        "80": "38", "84": "40", "88": "41", "90": "41", "94": "42", "98": "42", "102": "43", "106": "43", "110": "43", "114": "43", "118": "43", "122": "45", "126": "45", "130": "45",
        "20": "38", "21": "40", "22": "41", "23": "41", "24": "42", "25": "42", "26": "43", "27": "43", "28": "43", "29": "43", "30": "43", "31": "45", "32": "45", "33": "45", "34": "45", "35": "45",
        "47": "46", "49": "47", "51": "48", "53": "49", "55": "49", "57": "50", "59": "50", "61": "51", "63": "51", "65": "51", "67": "51", "69": "51", "71": "51", "73": "51", "75": "51"
      }
    },
    {
      code: "SIDESEAM",
      name: "Seitenlänge mit Bund (Sideseam w/ waistband)",
      norwegianName: "Sidelengde med linning",
      tolerance: "± 1",
      values: {
        N36: "97", N38: "99", "40": "100.5", "42": "102", "44": "103.5", "46": "106", "48": "108.5", "50": "111", "52": "113.5", "54": "116", "56": "119", "58": "120", "60": "122", "62": "123", "64": "125", "66": "126", "68": "128", "70": "129",
        "80": "105", "84": "106.5", "88": "108", "90": "110.5", "94": "113", "98": "115.5", "102": "118", "106": "120.5", "110": "123.5", "114": "124.5", "118": "126.5", "122": "127.5", "126": "129.5", "130": "130.5",
        "20": "96.5", "21": "98", "22": "99.5", "23": "102", "24": "104.5", "25": "107", "26": "109.5", "27": "112", "28": "115", "29": "116", "30": "118", "31": "119", "32": "121", "33": "122", "34": "124", "35": "125",
        "47": "101", "49": "103", "51": "105", "53": "107", "55": "109", "57": "111", "59": "113", "61": "115", "63": "115", "65": "116", "67": "116", "69": "117", "71": "117", "73": "118", "75": "118"
      }
    },
    {
      code: "INSEAM",
      name: "Schrittlänge (Inseam length)",
      norwegianName: "Innside benlengde",
      tolerance: "± 1",
      values: {
        N36: "74", N38: "75", "40": "76", "42": "77", "44": "78", "46": "80", "48": "82", "50": "84", "52": "86", "54": "88", "56": "90", "58": "90", "60": "91", "62": "91", "64": "92", "66": "92", "68": "93", "70": "93",
        "80": "80", "84": "81", "88": "82", "90": "84", "94": "86", "98": "88", "102": "90", "106": "92", "110": "94", "114": "94", "118": "95", "122": "95", "126": "96", "130": "96",
        "20": "72", "21": "73", "22": "74", "23": "76", "24": "78", "25": "80", "26": "82", "27": "84", "28": "86", "29": "86", "30": "87", "31": "87", "32": "88", "33": "88", "34": "89", "35": "89",
        "47": "74", "49": "75", "51": "76", "53": "77", "55": "78", "57": "79", "59": "79", "61": "80", "63": "81", "65": "81", "67": "82", "69": "82", "71": "83", "73": "83", "75": "84"
      }
    },
    {
      code: "ZIPPER",
      name: "RV-Schlitz-Öffnung (Zipper opening)",
      norwegianName: "Glidelåsåpning",
      tolerance: "± 0.5",
      values: {
        N36: "13", N38: "13", "40": "13", "42": "13", "44": "13", "46": "13", "48": "15", "50": "15", "52": "15", "54": "15", "56": "15", "58": "15", "60": "15", "62": "18", "64": "18", "66": "18", "68": "18", "70": "18",
        "80": "13", "84": "13", "88": "13", "90": "13", "94": "15", "98": "15", "102": "15", "106": "15", "110": "15", "114": "15", "118": "15", "122": "18", "126": "18", "130": "18",
        "20": "13", "21": "13", "22": "13", "23": "13", "24": "15", "25": "15", "26": "15", "27": "15", "28": "15", "29": "15", "30": "15", "31": "18", "32": "18", "33": "18", "34": "18", "35": "18",
        "47": "18", "49": "18", "51": "18", "53": "20", "55": "20", "57": "20", "59": "24", "61": "24", "63": "24", "65": "24", "67": "24", "69": "24", "71": "24", "73": "24", "75": "24"
      }
    },
    {
      code: "THIGH",
      name: "Oberschenkelweite (Thigh width)",
      norwegianName: "Lårvidde",
      tolerance: "± 2",
      values: {
        N36: "52", N38: "54", "40": "56", "42": "58", "44": "60", "46": "62", "48": "64", "50": "66", "52": "68", "54": "70", "56": "72.5", "58": "75", "60": "77.5", "62": "80", "64": "82.5", "66": "85", "68": "87.5", "70": "90",
        "80": "56", "84": "58", "88": "60", "90": "62", "94": "64", "98": "66", "102": "68", "106": "70", "110": "72.5", "114": "75", "118": "77.5", "122": "80", "126": "82.5", "130": "85",
        "20": "56", "21": "58", "22": "60", "23": "62", "24": "64", "25": "66", "26": "68", "27": "70", "28": "72.5", "29": "75", "30": "77.5", "31": "80", "32": "82.5", "33": "85", "34": "87.5", "35": "90",
        "47": "69", "49": "71.5", "51": "74", "53": "76.5", "55": "79", "57": "81.5", "59": "84", "61": "86.5", "63": "89", "65": "91.5", "67": "94", "69": "96.5", "71": "99", "73": "101.5", "75": "104"
      }
    }
  ]
};

// 14. Article 200127 (Haugesund / Risør)
const SIZE_CHART_200127 = {
  title: "Size Chart for Article 200127",
  applicableStyles: ["200127"],
  unit: "cm",
  sizes: [
    { key: "XS", label: "XS (40-42)", colorBadge: "yellow", colorHex: "#eab308", textHex: "#854d0e" },
    { key: "S", label: "S (44-46)", colorBadge: "green", colorHex: "#22c55e", textHex: "#14532d" },
    { key: "M", label: "M (48-50)", colorBadge: "medium blue", colorHex: "#3b82f6", textHex: "#1e3a8a" },
    { key: "L", label: "L (52-54)", colorBadge: "red", colorHex: "#ef4444", textHex: "#7f1d1d" },
    { key: "XL", label: "XL (56-58)", colorBadge: "black", colorHex: "#1e293b", textHex: "#ffffff" },
    { key: "2XL", label: "2XL (60-62)", colorBadge: "violet", colorHex: "#8b5cf6", textHex: "#ffffff" },
    { key: "3XL", label: "3XL (64-66)", colorBadge: "brown", colorHex: "#78350f", textHex: "#ffffff" },
    { key: "4XL", label: "4XL (68-70)", colorBadge: "orange", colorHex: "#ea580c", textHex: "#ffffff" }
  ],
  measurements: [
    { code: "WAISTBAND", name: "Bundweite (Waistband)", norwegianName: "Linningvidde", tolerance: "± 2", values: { XS: "64", S: "72", M: "80", L: "88", XL: "100", "2XL": "112", "3XL": "124", "4XL": "136" } },
    { code: "HIP", name: "Hüftweite (Hip)", norwegianName: "Hoftevidde", tolerance: "± 2", values: { XS: "94", S: "102", M: "110", L: "118", XL: "128", "2XL": "138", "3XL": "148", "4XL": "158" } },
    { code: "SIDESEAM", name: "SL mit Bund (Sideseam with waistband)", norwegianName: "Sidelengde med linning", tolerance: "± 1", values: { XS: "99", S: "104", M: "109", L: "114", XL: "118", "2XL": "121", "3XL": "124", "4XL": "127" } },
    { code: "INSEAM", name: "Schrittlänge (Inside seam)", norwegianName: "Innside benlengde", tolerance: "± 1", values: { XS: "75", S: "79", M: "83", L: "87", XL: "89", "2XL": "90", "3XL": "91", "4XL": "92" } },
    { code: "HEM", name: "Fußweite (Hem)", norwegianName: "Fotvidde", tolerance: "± 1", values: { XS: "42", S: "43", M: "44", L: "45", XL: "46", "2XL": "47", "3XL": "48", "4XL": "49" } },
    { code: "RUBBER", name: "Gummi cm (Rubber length)", norwegianName: "Strikklengde", tolerance: "± 1", values: { XS: "64", S: "72", M: "80", L: "88", XL: "100", "2XL": "112", "3XL": "124", "4XL": "136" } },
    { code: "RIBBON", name: "Kordel cm (Ribbon length)", norwegianName: "Snørebåndlengde", tolerance: "± 2", values: { XS: "120", S: "130", M: "140", L: "150", XL: "160", "2XL": "170", "3XL": "180", "4XL": "190" } }
  ]
};

// Fallback in-memory map of all available static charts
const STATIC_CHARTS = {
  "10101": SIZE_CHART_10101,
  "10102": SIZE_CHART_10102,
  "10105": SIZE_CHART_10105_10106_10116,
  "10106": SIZE_CHART_10105_10106_10116,
  "10116": SIZE_CHART_10105_10106_10116,
  "10107": SIZE_CHART_10107_10108,
  "10108": SIZE_CHART_10107_10108,
  "10109": SIZE_CHART_10109,
  "10122": SIZE_CHART_10122,
  "10123": SIZE_CHART_10123,
  "10124": SIZE_CHART_10124,
  "20110": SIZE_CHART_20110,
  "20111": SIZE_CHART_20111,
  "200120": SIZE_CHART_200120,
  "200121": SIZE_CHART_200120,
  "200122": SIZE_CHART_200120,
  "200123": SIZE_CHART_200123,
  "200124": SIZE_CHART_200123,
  "200125": SIZE_CHART_200123,
  "200126": SIZE_CHART_200126,
  "200127": SIZE_CHART_200127,
};

module.exports = {
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
  normalizeSizeKey,
  getSingleSizeMeasurements,
};
