const app = require("./app");
const env = require("./config/env");
const {
  startReminderWorker,
} = require("./modules/task/task-reminder.service");
const ensureDefaultAdmin = require("../prisma/seed");

const server = app.listen(env.port, async () => {
  try {
    await ensureDefaultAdmin();
  } catch (err) {
    console.warn("ensureDefaultAdmin warning:", err.message);
  }
  try {
    startReminderWorker();
  } catch (err) {
    console.warn("startReminderWorker warning:", err.message);
  }
  console.log("========================================");
  console.log(`Server running on port ${env.port}`);
  console.log("========================================");
});

server.on("error", (err) => {
  console.error("Server listen error:", err.message);
});

module.exports = server;
