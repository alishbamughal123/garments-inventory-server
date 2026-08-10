const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const routes = require("./routes");
const env = require("./config/env");

const app = express();

// Dynamic CORS Origin Validator
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Allow non-browser requests (Postman, server-to-server)
  
  if (env.corsOrigins.includes(origin) || env.corsOrigins.includes("*")) {
    return true;
  }
  
  // Allow all Vercel deployments & localhost variations
  if (
    origin.endsWith(".vercel.app") ||
    origin.includes("localhost") ||
    origin.includes("127.0.0.1")
  ) {
    return true;
  }
  
  return true; // Fallback to allow cross-origin requests cleanly
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
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

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", routes);

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Garment Stock Management API Running Successfully",
  });
});

module.exports = app;
