const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const {
  PrismaPg,
} = require("@prisma/adapter-pg");

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const buildDatabaseUrl = () => {
  let rawUrl = process.env.DATABASE_URL;

  if (!rawUrl) {
    return undefined;
  }

  // Remove any newlines, whitespace or surrounding quotes
  rawUrl = rawUrl.trim().replace(/^["']|["']$/g, "").replace(/\s+/g, "");

  try {
    const url = new URL(rawUrl);

    if (
      !url.searchParams.has(
        "connection_limit"
      )
    ) {
      url.searchParams.set(
        "connection_limit",
        "3"
      );
    }

    if (
      !url.searchParams.has(
        "pool_timeout"
      )
    ) {
      url.searchParams.set(
        "pool_timeout",
        "20"
      );
    }

    return url.toString();
  } catch {
    return rawUrl;
  }
};

const globalForPrisma =
  globalThis;

const connectionString =
  buildDatabaseUrl();

const fs = require("fs");
const path = require("path");

const getCaCert = () => {
  const possiblePaths = [
    path.join(__dirname, "../../ca-certificate.crt"),
    path.join(__dirname, "../ca-certificate.crt"),
    path.join(__dirname, "../../certs/ca-certificate.crt"),
    path.join(process.cwd(), "ca-certificate.crt"),
    path.join(process.cwd(), "certs/ca-certificate.crt"),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        return fs.readFileSync(p, "utf-8");
      } catch (e) {}
    }
  }
  return undefined;
};

const caCert = getCaCert();

const globalForPgPool = globalThis;

const pgPool =
  globalForPgPool.pgPool ||
  new Pool({
    connectionString,
    max: 3,
    ssl: caCert
      ? {
          ca: caCert,
          rejectUnauthorized: false,
        }
      : {
          rejectUnauthorized: false,
        },
  });

const adapter =
  new PrismaPg(pgPool);

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (
  process.env.NODE_ENV !==
  "production"
) {
  globalForPrisma.prisma =
    prisma;
  globalForPgPool.pgPool =
    pgPool;
}

module.exports = prisma;
