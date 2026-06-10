const parseOrigins = (
  rawOrigins = ""
) =>
  rawOrigins
    .split(",")
    .map((origin) =>
      origin.trim()
    )
    .filter(Boolean);

const defaultOrigins = [
  "http://localhost:5173",
  "https://garments-inventory-client.vercel.app",
];

const env = {
  port:
    Number(process.env.PORT) ||
    8000,
  corsOrigins:
    parseOrigins(
      process.env.CLIENT_ORIGINS
    ).length > 0
      ? parseOrigins(
          process.env.CLIENT_ORIGINS
        )
      : defaultOrigins,
};

module.exports = env;
