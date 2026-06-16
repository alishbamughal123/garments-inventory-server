const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const {
  PrismaPg,
} = require("@prisma/adapter-pg");

const buildDatabaseUrl = () => {
  const rawUrl =
    process.env.DATABASE_URL;

  if (!rawUrl) {
    return undefined;
  }

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

const globalForPgPool =
  globalThis;

const pgPool =
  globalForPgPool.pgPool ||
  new Pool({
    connectionString,
    max: 3,
    ssl: {
      rejectUnauthorized:
        false,
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
