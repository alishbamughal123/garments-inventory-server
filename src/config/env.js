const parseOrigins = (rawOrigins = "") =>
  rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://garments-inventory-client.vercel.app",
];

const env = {
  port: Number(process.env.PORT) || 8000,
  apiBaseUrl:
    process.env.API_BASE_URL ||
    `http://localhost:${Number(process.env.PORT) || 8000}`,
  corsOrigins:
    parseOrigins(process.env.CLIENT_ORIGINS).length > 0
      ? parseOrigins(process.env.CLIENT_ORIGINS)
      : defaultOrigins,
  emailFromName: process.env.EMAIL_FROM_NAME || "Garments CRM",
  emailFromAddress:
    process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || "",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpSecure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  emailInboundSecret: process.env.EMAIL_INBOUND_SECRET || "",
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || "",
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || "",
  reminderWorkerEnabled:
    String(process.env.REMINDER_WORKER_ENABLED ?? "true").toLowerCase() !==
    "false",
  reminderWorkerIntervalMs:
    Number(process.env.REMINDER_WORKER_INTERVAL_MS) || 30000,
};

module.exports = env;
