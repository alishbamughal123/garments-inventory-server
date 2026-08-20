const app = require("./app");
const env = require("./config/env");
const {
  startReminderWorker,
} = require("./modules/task/task-reminder.service");
const ensureDefaultAdmin = require("../prisma/seed");

app.listen(env.port, async () => {
  await ensureDefaultAdmin();
  console.log('DB URL being used:', process.env.DATABASE_URL);
  startReminderWorker();
  console.log("========================================");
  console.log(
    `Server running on port ${env.port}`
  );
  console.log("========================================");
});
