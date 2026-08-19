const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const routes = require("./routes");
const env = require("./config/env");

const app = express();

app.set("trust proxy", 1);

/*
|--------------------------------------------------------------------------
| BULLETPROOF CORS HEADER MIDDLEWARE
|--------------------------------------------------------------------------
| Guarantees Access-Control-Allow-Origin on all endpoints and OPTIONS preflights
*/
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const path = require("path");

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check endpoint for Railway
app.get("/health", (req, res) => {
  return res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Garment Stock Management API Running Successfully",
  });
});

app.use("/api/v1", routes);
app.use("/api", routes);

// Global Error Handler guaranteeing CORS headers on error responses
app.use((err, req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");

  console.error("Unhandled Error:", err);
  return res.status(err.status || err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;

