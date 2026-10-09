const prismaClient = require("@prisma/client");

/*
| Helpers to build "search every displayed column" conditions.
*/

// Enum members whose name (or spaced label, e.g. "In Progress") contains the term.
const enumMatches = (enumName, term) => {
  const enumObj = prismaClient[enumName];
  if (!enumObj || !term) return [];
  const normalized = String(term).trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (!normalized) return [];
  return Object.values(enumObj).filter((member) => member.includes(normalized));
};

// Builds [{ field: { in: [...] } }] for an enum field, or [] when nothing matches.
const enumCondition = (field, enumName, term) => {
  const matches = enumMatches(enumName, term);
  return matches.length > 0 ? [{ [field]: { in: matches } }] : [];
};

const parseNumber = (term) => {
  const raw = String(term || "").trim().replace(/\s+/g, "").replace(/,/g, "");
  if (!raw || !/^-?\d+(\.\d+)?$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

// Numeric equals conditions. Set isInt for Int columns (only safe integers match).
const numberCondition = (field, term, isInt = false) => {
  const n = parseNumber(term);
  if (n === null) return [];
  if (isInt && (!Number.isInteger(n) || Math.abs(n) > 2147483647)) return [];
  return [{ [field]: { equals: n } }];
};

// Parses YYYY-MM-DD, DD.MM.YYYY, DD/MM/YYYY into a [gte, lt) day range.
const parseDayRange = (term) => {
  const s = String(term || "").trim();
  let y;
  let m;
  let d;
  let match = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    [, y, m, d] = match;
  } else {
    match = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
    if (!match) return null;
    [, d, m, y] = match;
  }
  const start = new Date(Number(y), Number(m) - 1, Number(d));
  if (
    Number.isNaN(start.getTime()) ||
    start.getMonth() !== Number(m) - 1 ||
    start.getDate() !== Number(d)
  ) {
    return null;
  }
  return { gte: start, lt: new Date(Number(y), Number(m) - 1, Number(d) + 1) };
};

const dateCondition = (field, term) => {
  const range = parseDayRange(term);
  return range ? [{ [field]: range }] : [];
};

module.exports = {
  enumMatches,
  enumCondition,
  parseNumber,
  numberCondition,
  parseDayRange,
  dateCondition,
};
