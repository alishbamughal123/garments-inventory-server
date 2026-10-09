/*
|--------------------------------------------------------------------------
| SEARCH HELPERS
| Small helpers used to build Prisma `where` conditions for list search boxes.
|--------------------------------------------------------------------------
*/

// Returns a Number when the term is purely numeric (e.g. "12", "1,250.50"), otherwise null.
const parseSearchNumber = (term) => {
  const cleaned = String(term || "").trim().replace(/,/g, ".");
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
};

// Returns an integer that is safe for a Prisma Int column, otherwise null.
const parseSearchInt = (term) => {
  const value = parseSearchNumber(term);
  if (value === null || !Number.isInteger(value)) return null;
  if (Math.abs(value) > 2147483647) return null;
  return value;
};

// Supports YYYY-MM-DD, DD.MM.YYYY and DD/MM/YYYY. Returns { gte, lt } for that day, otherwise null.
const parseSearchDateRange = (term) => {
  const value = String(term || "").trim();
  let year;
  let month;
  let day;

  let match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    [, year, month, day] = match;
  } else {
    match = value.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
    if (!match) return null;
    [, day, month, year] = match;
  }

  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;

  const start = new Date(y, m - 1, d);
  if (start.getMonth() !== m - 1 || start.getDate() !== d) return null;

  return { gte: start, lt: new Date(y, m - 1, d + 1) };
};

// Returns the enum members whose name (or on-screen label) contains the term.
// "stock in" matches STOCK_IN, "out" matches STOCK_OUT, etc.
const matchEnumValues = (enumValues, term) => {
  const raw = String(term || "").trim().toLowerCase();
  if (!raw) return [];
  const normalized = raw.replace(/[\s-]+/g, "_");

  return enumValues.filter((entry) => {
    const lower = entry.toLowerCase();
    return (
      lower.includes(normalized) ||
      lower.replace(/_/g, " ").includes(raw)
    );
  });
};

module.exports = {
  parseSearchNumber,
  parseSearchInt,
  parseSearchDateRange,
  matchEnumValues,
};
